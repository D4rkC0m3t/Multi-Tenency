import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsAndConditions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <ArrowLeft
            size={24}
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(-1)}
          />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Terms and Conditions
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Last Updated: October 22, 2025
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ '& h2': { mt: 4, mb: 2 }, '& p': { mb: 2 }, '& ul': { mb: 2, pl: 3 } }}>
            <Typography variant="h5" component="h2" fontWeight="bold">
              1. Introduction
            </Typography>
            <Typography paragraph>
              Welcome to KrishiSethu Fertilizer Inventory Management System ("Service", "Platform", "we", "us", or "our"). 
              These Terms and Conditions ("Terms") govern your access to and use of our multi-tenant inventory management 
              platform designed for fertilizer retailers and distributors in India.
            </Typography>
            <Typography paragraph>
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of 
              these Terms, you may not access the Service.
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              2. Definitions
            </Typography>
            <Typography component="div">
              <ul>
                <li><strong>Account:</strong> A unique account created for you to access our Service</li>
                <li><strong>Merchant:</strong> A business entity (retailer/distributor) using our platform</li>
                <li><strong>User:</strong> Any individual who accesses or uses the Service</li>
                <li><strong>Subscription:</strong> The paid plan you select to access premium features</li>
                <li><strong>Content:</strong> All data, information, and materials uploaded or created using the Service</li>
              </ul>
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              3. Account Registration
            </Typography>
            <Typography paragraph>
              <strong>3.1 Eligibility:</strong> You must be at least 18 years old and legally capable of entering into 
              binding contracts to use this Service.
            </Typography>
            <Typography paragraph>
              <strong>3.2 Account Information:</strong> You must provide accurate, current, and complete information 
              during registration, including:
            </Typography>
            <Typography component="div">
              <ul>
                <li>Business name and registration details</li>
                <li>GSTIN (Goods and Services Tax Identification Number)</li>
                <li>Contact information (email, phone number)</li>
                <li>Business address and license numbers</li>
              </ul>
            </Typography>
            <Typography paragraph>
              <strong>3.3 Account Security:</strong> You are responsible for maintaining the confidentiality of your 
              account credentials and for all activities that occur under your account.
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              4. Subscription Plans and Payments
            </Typography>
            <Typography paragraph>
              <strong>4.1 Subscription Tiers:</strong> We offer multiple subscription plans with varying features and 
              pricing. Details are available on our pricing page.
            </Typography>
            <Typography paragraph>
              <strong>4.2 Payment Processing:</strong> Payments are processed through PhonePe Payment Gateway. By making 
              a payment, you agree to PhonePe's terms and conditions.
            </Typography>
            <Typography paragraph>
              <strong>4.3 Billing Cycle:</strong> Subscriptions are billed on a monthly or annual basis, as selected 
              during purchase.
            </Typography>
            <Typography paragraph>
              <strong>4.4 Auto-Renewal:</strong> Subscriptions automatically renew unless cancelled before the renewal date.
            </Typography>
            <Typography paragraph>
              <strong>4.5 Price Changes:</strong> We reserve the right to modify subscription prices with 30 days' notice 
              to existing subscribers.
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              5. Use of Service
            </Typography>
            <Typography paragraph>
              <strong>5.1 Permitted Use:</strong> You may use the Service for lawful business purposes related to 
              fertilizer inventory management.
            </Typography>
            <Typography paragraph>
              <strong>5.2 Prohibited Activities:</strong> You agree NOT to:
            </Typography>
            <Typography component="div">
              <ul>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Upload malicious code or viruses</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Resell or redistribute the Service without authorization</li>
                <li>Use the Service for fraudulent purposes</li>
                <li>Share your account credentials with unauthorized parties</li>
              </ul>
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              6. Data and Privacy
            </Typography>
            <Typography paragraph>
              <strong>6.1 Data Ownership:</strong> You retain all rights to your business data uploaded to the platform.
            </Typography>
            <Typography paragraph>
              <strong>6.2 Data Security:</strong> We implement industry-standard security measures including:
            </Typography>
            <Typography component="div">
              <ul>
                <li>Row-Level Security (RLS) for multi-tenant data isolation</li>
                <li>Encrypted data transmission (SSL/TLS)</li>
                <li>Regular security audits and updates</li>
                <li>Secure authentication via Supabase</li>
              </ul>
            </Typography>
            <Typography paragraph>
              <strong>6.3 Data Processing:</strong> We process your data in accordance with our Privacy Policy and 
              applicable data protection laws.
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              7. Intellectual Property
            </Typography>
            <Typography paragraph>
              <strong>7.1 Our Rights:</strong> The Service, including its original content, features, and functionality, 
              is owned by us and protected by copyright, trademark, and other intellectual property laws.
            </Typography>
            <Typography paragraph>
              <strong>7.2 Your License:</strong> We grant you a limited, non-exclusive, non-transferable license to use 
              the Service for your business purposes during your subscription period.
            </Typography>
            <Typography paragraph>
              <strong>7.3 Feedback:</strong> Any feedback, suggestions, or ideas you provide may be used by us without 
              obligation or compensation to you.
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              8. Service Availability
            </Typography>
            <Typography paragraph>
              <strong>8.1 Uptime:</strong> We strive to maintain 99.9% uptime but do not guarantee uninterrupted access.
            </Typography>
            <Typography paragraph>
              <strong>8.2 Maintenance:</strong> We may perform scheduled maintenance with advance notice when possible.
            </Typography>
            <Typography paragraph>
              <strong>8.3 Service Modifications:</strong> We reserve the right to modify, suspend, or discontinue any 
              part of the Service with reasonable notice.
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              9. Cancellation and Termination
            </Typography>
            <Typography paragraph>
              <strong>9.1 Cancellation by You:</strong> You may cancel your subscription at any time through your account 
              settings. Cancellation takes effect at the end of the current billing period.
            </Typography>
            <Typography paragraph>
              <strong>9.2 Termination by Us:</strong> We may suspend or terminate your account if you:
            </Typography>
            <Typography component="div">
              <ul>
                <li>Violate these Terms</li>
                <li>Engage in fraudulent activity</li>
                <li>Fail to pay subscription fees</li>
                <li>Use the Service in a manner that harms our systems or other users</li>
              </ul>
            </Typography>
            <Typography paragraph>
              <strong>9.3 Data Retention:</strong> Upon termination, your data will be retained for 30 days, after which 
              it may be permanently deleted.
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              10. Refund Policy
            </Typography>
            <Typography paragraph>
              Please refer to our separate Refund Policy for detailed information about refunds, cancellations, and 
              chargebacks.
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              11. Limitation of Liability
            </Typography>
            <Typography paragraph>
              <strong>11.1 No Warranties:</strong> The Service is provided "as is" without warranties of any kind, either 
              express or implied.
            </Typography>
            <Typography paragraph>
              <strong>11.2 Liability Cap:</strong> Our total liability to you for any claims arising from your use of the 
              Service shall not exceed the amount you paid us in the 12 months preceding the claim.
            </Typography>
            <Typography paragraph>
              <strong>11.3 Exclusions:</strong> We are not liable for:
            </Typography>
            <Typography component="div">
              <ul>
                <li>Indirect, incidental, or consequential damages</li>
                <li>Loss of profits, data, or business opportunities</li>
                <li>Damages resulting from third-party services (e.g., PhonePe)</li>
                <li>Force majeure events beyond our control</li>
              </ul>
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              12. Indemnification
            </Typography>
            <Typography paragraph>
              You agree to indemnify and hold us harmless from any claims, damages, losses, liabilities, and expenses 
              (including legal fees) arising from:
            </Typography>
            <Typography component="div">
              <ul>
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Your business data or content</li>
              </ul>
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              13. Compliance with Laws
            </Typography>
            <Typography paragraph>
              <strong>13.1 GST Compliance:</strong> You are responsible for ensuring GST compliance in your business 
              operations. Our platform provides tools to assist with GST calculations and e-invoicing, but you remain 
              responsible for accurate tax reporting.
            </Typography>
            <Typography paragraph>
              <strong>13.2 Fertilizer Regulations:</strong> You must comply with all applicable fertilizer control orders, 
              licensing requirements, and regulations in your jurisdiction.
            </Typography>
            <Typography paragraph>
              <strong>13.3 Data Protection:</strong> You must comply with applicable data protection laws when using our Service.
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              14. Dispute Resolution
            </Typography>
            <Typography paragraph>
              <strong>14.1 Governing Law:</strong> These Terms are governed by the laws of India.
            </Typography>
            <Typography paragraph>
              <strong>14.2 Jurisdiction:</strong> Any disputes shall be subject to the exclusive jurisdiction of courts 
              in [Your City], India.
            </Typography>
            <Typography paragraph>
              <strong>14.3 Arbitration:</strong> We encourage resolving disputes through good-faith negotiation or 
              mediation before pursuing legal action.
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              15. Changes to Terms
            </Typography>
            <Typography paragraph>
              We reserve the right to modify these Terms at any time. We will notify you of significant changes via email 
              or through the Service. Your continued use of the Service after changes constitutes acceptance of the new Terms.
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              16. Contact Information
            </Typography>
            <Typography paragraph>
              For questions about these Terms, please contact us at:
            </Typography>
            <Typography component="div">
              <ul>
                <li><strong>Email:</strong> support@krishisethu.com</li>
                <li><strong>Phone:</strong> +91 [Your Phone Number]</li>
                <li><strong>Address:</strong> [Your Business Address]</li>
              </ul>
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              17. Severability
            </Typography>
            <Typography paragraph>
              If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in 
              full force and effect.
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              18. Entire Agreement
            </Typography>
            <Typography paragraph>
              These Terms, together with our Privacy Policy and Refund Policy, constitute the entire agreement between 
              you and us regarding the Service.
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Typography variant="body2" color="text.secondary" align="center">
              By using KrishiSethu Fertilizer Inventory Management System, you acknowledge that you have read, 
              understood, and agree to be bound by these Terms and Conditions.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default TermsAndConditions;
