// IRP (Invoice Registration Portal) API Integration Service
// This service handles communication with the Government's E-Invoice portal

import { EInvoicePayload } from './einvoiceGenerator';
import { supabase } from './supabase';

// IRP API Response Types
export interface IRPAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface IRPGenerateResponse {
  success: boolean;
  message: string;
  result?: {
    AckNo: string;
    AckDt: string;
    Irn: string;
    SignedInvoice: string;
    SignedQRCode: string;
    Status: string;
    EwbNo?: string;
    EwbDt?: string;
    EwbValidTill?: string;
  };
  error?: {
    error_cd: string;
    message: string;
  };
}

export interface IRPCancelResponse {
  success: boolean;
  message: string;
  result?: {
    Irn: string;
    CancelDate: string;
  };
  error?: {
    error_cd: string;
    message: string;
  };
}

export interface EInvoiceConfig {
  id: string;
  merchant_id: string;
  is_enabled: boolean;
  irp_username: string;
  irp_password_encrypted: string;
  client_id: string;
  client_secret_encrypted: string;
  gstin: string;
  irp_base_url: string;
  einvoice_threshold: number;
  auto_generate_einvoice: boolean;
}

// Encryption/Decryption utilities (simplified - use proper encryption in production)
function encryptCredential(credential: string): string {
  // In production, use proper encryption like AES
  return btoa(credential);
}

function decryptCredential(encryptedCredential: string): string {
  // In production, use proper decryption
  return atob(encryptedCredential);
}

export class IRPApiService {
  private config: EInvoiceConfig;
  private accessToken?: string;
  private tokenExpiry?: Date;

  constructor(config: EInvoiceConfig) {
    this.config = config;
  }

  // Authenticate with IRP and get access token
  private async authenticate(): Promise<string> {
    try {
      // Check if we have a valid token
      if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.accessToken;
      }

      const authUrl = `${this.config.irp_base_url}/v1.03/auth`;
      const credentials = {
        username: this.config.irp_username,
        password: decryptCredential(this.config.irp_password_encrypted),
        client_id: this.config.client_id,
        client_secret: decryptCredential(this.config.client_secret_encrypted),
        grant_type: 'password'
      };

      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'gstin': this.config.gstin
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const authData: IRPAuthResponse = await response.json();
      this.accessToken = authData.access_token;
      this.tokenExpiry = new Date(Date.now() + (authData.expires_in * 1000));

      // Log successful authentication
      await this.logAuditEntry('authenticate', 'success', credentials, authData);

      return this.accessToken;
    } catch (error) {
      await this.logAuditEntry('authenticate', 'error', {}, null, error.message);
      throw error;
    }
  }

  // Generate E-Invoice via IRP
  async generateEInvoice(payload: EInvoicePayload, saleId: string): Promise<IRPGenerateResponse> {
    try {
      const token = await this.authenticate();
      const generateUrl = `${this.config.irp_base_url}/v1.03/invoice`;

      const response = await fetch(generateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'gstin': this.config.gstin,
          'user_name': this.config.irp_username
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorResponse: IRPGenerateResponse = {
          success: false,
          message: responseData.message || 'E-Invoice generation failed',
          error: responseData.error
        };
        
        await this.logAuditEntry('generate', 'error', payload, responseData, responseData.message, saleId);
        return errorResponse;
      }

      const successResponse: IRPGenerateResponse = {
        success: true,
        message: 'E-Invoice generated successfully',
        result: responseData
      };

      // Store the E-Invoice metadata in database
      if (responseData.Irn) {
        await this.storeEInvoiceMetadata(saleId, payload, responseData);
      }

      await this.logAuditEntry('generate', 'success', payload, responseData, null, saleId);
      return successResponse;

    } catch (error) {
      const errorResponse: IRPGenerateResponse = {
        success: false,
        message: error.message || 'E-Invoice generation failed'
      };
      
      await this.logAuditEntry('generate', 'error', payload, null, error.message, saleId);
      return errorResponse;
    }
  }

  // Cancel E-Invoice via IRP
  async cancelEInvoice(irn: string, reason: string, saleId?: string): Promise<IRPCancelResponse> {
    try {
      const token = await this.authenticate();
      const cancelUrl = `${this.config.irp_base_url}/v1.03/invoice/cancel`;

      const cancelPayload = {
        Irn: irn,
        CnlRsn: reason, // Cancellation reason code
        CnlRem: reason  // Cancellation remarks
      };

      const response = await fetch(cancelUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'gstin': this.config.gstin,
          'user_name': this.config.irp_username
        },
        body: JSON.stringify(cancelPayload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorResponse: IRPCancelResponse = {
          success: false,
          message: responseData.message || 'E-Invoice cancellation failed',
          error: responseData.error
        };
        
        await this.logAuditEntry('cancel', 'error', cancelPayload, responseData, responseData.message, saleId);
        return errorResponse;
      }

      // Update E-Invoice metadata in database
      if (responseData.Irn) {
        await this.updateEInvoiceStatus(irn, 'cancelled', reason);
      }

      const successResponse: IRPCancelResponse = {
        success: true,
        message: 'E-Invoice cancelled successfully',
        result: responseData
      };

      await this.logAuditEntry('cancel', 'success', cancelPayload, responseData, null, saleId);
      return successResponse;

    } catch (error) {
      const errorResponse: IRPCancelResponse = {
        success: false,
        message: error.message || 'E-Invoice cancellation failed'
      };
      
      await this.logAuditEntry('cancel', 'error', { irn, reason }, null, error.message, saleId);
      return errorResponse;
    }
  }

  // Get E-Invoice details by IRN
  async getEInvoiceByIRN(irn: string): Promise<any> {
    try {
      const token = await this.authenticate();
      const getUrl = `${this.config.irp_base_url}/v1.03/invoice/irn/${irn}`;

      const response = await fetch(getUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'gstin': this.config.gstin,
          'user_name': this.config.irp_username
        }
      });

      const responseData = await response.json();
      await this.logAuditEntry('verify', response.ok ? 'success' : 'error', { irn }, responseData);

      return responseData;
    } catch (error) {
      await this.logAuditEntry('verify', 'error', { irn }, null, error.message);
      throw error;
    }
  }

  // Store E-Invoice metadata in Supabase
  private async storeEInvoiceMetadata(saleId: string, payload: EInvoicePayload, irpResponse: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('einvoice_metadata')
        .insert({
          merchant_id: this.config.merchant_id,
          sale_id: saleId,
          irn: irpResponse.Irn,
          ack_no: irpResponse.AckNo,
          ack_date: new Date(irpResponse.AckDt),
          signed_invoice_json: irpResponse.SignedInvoice,
          signed_qr_code: irpResponse.SignedQRCode,
          status: 'active',
          irp_request_payload: payload,
          irp_response_raw: irpResponse
        });

      if (error) {
        console.error('Error storing E-Invoice metadata:', error);
        throw error;
      }

      // Update sale record with E-Invoice status
      await supabase
        .from('sales')
        .update({ 
          einvoice_status: 'generated',
          buyer_gstin: payload.BuyerDtls.Gstin 
        })
        .eq('id', saleId);

    } catch (error) {
      console.error('Error storing E-Invoice metadata:', error);
      throw error;
    }
  }

  // Update E-Invoice status (for cancellation)
  private async updateEInvoiceStatus(irn: string, status: string, reason?: string): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date()
      };

      if (status === 'cancelled') {
        updateData.cancellation_date = new Date();
        updateData.cancellation_reason = reason;
      }

      const { error } = await supabase
        .from('einvoice_metadata')
        .update(updateData)
        .eq('irn', irn);

      if (error) {
        console.error('Error updating E-Invoice status:', error);
        throw error;
      }

      // Also update the sale record
      if (status === 'cancelled') {
        const { data: einvoiceData } = await supabase
          .from('einvoice_metadata')
          .select('sale_id')
          .eq('irn', irn)
          .single();

        if (einvoiceData) {
          await supabase
            .from('sales')
            .update({ einvoice_status: 'cancelled' })
            .eq('id', einvoiceData.sale_id);
        }
      }

    } catch (error) {
      console.error('Error updating E-Invoice status:', error);
      throw error;
    }
  }

  // Log audit entry
  private async logAuditEntry(
    operation: string,
    status: string,
    requestData: any,
    responseData?: any,
    errorMessage?: string,
    saleId?: string
  ): Promise<void> {
    try {
      await supabase
        .from('einvoice_audit_log')
        .insert({
          merchant_id: this.config.merchant_id,
          sale_id: saleId || null,
          operation,
          status,
          request_data: requestData,
          response_data: responseData,
          error_message: errorMessage,
          response_timestamp: new Date()
        });
    } catch (error) {
      console.error('Error logging audit entry:', error);
    }
  }
}

// E-Invoice eligibility check function
export async function isEInvoiceEligible(
  sale: any,
  customer: any,
  merchant: any
): Promise<{ eligible: boolean; reasons: string[] }> {
  const reasons: string[] = [];
  let eligible = true;

  // Check if merchant has GSTIN
  if (!merchant.gstin) {
    eligible = false;
    reasons.push('Merchant GSTIN not configured');
  }

  // Check if customer has GSTIN (B2B requirement)
  if (!customer.gstin) {
    eligible = false;
    reasons.push('Customer GSTIN required for E-Invoice (B2B only)');
  }

  // Check invoice amount threshold (default ₹500)
  const threshold = 500; // This should come from config
  if (sale.total_amount < threshold) {
    eligible = false;
    reasons.push(`Invoice amount ₹${sale.total_amount} is below threshold ₹${threshold}`);
  }

  // Check if sale is not cancelled/returned
  if (sale.status === 'cancelled' || sale.status === 'returned') {
    eligible = false;
    reasons.push('Cannot generate E-Invoice for cancelled/returned sales');
  }

  // Add success reasons if eligible
  if (eligible) {
    reasons.push('B2B transaction with valid GSTIN');
    reasons.push(`Invoice amount ₹${sale.total_amount} meets threshold`);
    reasons.push('All mandatory fields available');
  }

  return { eligible, reasons };
}

// Factory function to create IRP service instance
export async function createIRPService(merchantId: string): Promise<IRPApiService | null> {
  try {
    const { data: config, error } = await supabase
      .from('einvoice_config')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('is_enabled', true)
      .single();

    if (error || !config) {
      console.error('E-Invoice not configured for merchant:', merchantId);
      return null;
    }

    return new IRPApiService(config);
  } catch (error) {
    console.error('Error creating IRP service:', error);
    return null;
  }
}

// Utility functions for E-Invoice management
export async function checkEInvoiceEligibility(saleId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('check_einvoice_eligibility', { sale_id: saleId });

    if (error) {
      console.error('Error checking E-Invoice eligibility:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error checking E-Invoice eligibility:', error);
    return false;
  }
}

export async function getEInvoiceMetadata(saleId: string) {
  try {
    const { data, error } = await supabase
      .from('einvoice_metadata')
      .select('*')
      .eq('sale_id', saleId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching E-Invoice metadata:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching E-Invoice metadata:', error);
    return null;
  }
}

// Configuration management functions
export async function saveEInvoiceConfig(merchantId: string, config: Partial<EInvoiceConfig>): Promise<boolean> {
  try {
    // Encrypt sensitive fields
    const configData = {
      ...config,
      merchant_id: merchantId,
      irp_password_encrypted: config.irp_password_encrypted ? 
        encryptCredential(config.irp_password_encrypted) : undefined,
      client_secret_encrypted: config.client_secret_encrypted ? 
        encryptCredential(config.client_secret_encrypted) : undefined
    };

    const { error } = await supabase
      .from('einvoice_config')
      .upsert(configData, { onConflict: 'merchant_id' });

    if (error) {
      console.error('Error saving E-Invoice config:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving E-Invoice config:', error);
    return false;
  }
}

export async function getEInvoiceConfig(merchantId: string): Promise<EInvoiceConfig | null> {
  try {
    const { data, error } = await supabase
      .from('einvoice_config')
      .select('*')
      .eq('merchant_id', merchantId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching E-Invoice config:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching E-Invoice config:', error);
    return null;
  }
}
