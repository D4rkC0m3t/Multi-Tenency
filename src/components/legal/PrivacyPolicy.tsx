import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
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
            Privacy Policy
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
              KrishiSethu ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains 
              how we collect, use, disclose, and safeguard your information when you use our Fertilizer Inventory 
              Management System ("Service").
            </Typography>
            <Typography paragraph>
              By using our Service, you consent to the data practices described in this policy. If you do not agree 
              with this policy, please do not use our Service.
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              2. Information We Collect
            </Typography>
            
            <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
              2.1 Information You Provide
            </Typography>
            <Typography paragraph>
              We collect information that you voluntarily provide when using our Service:
            </Typography>
            <Typography component="div">
              <ul>
                <li><strong>Account Information:</strong> Name, email address, phone number, password</li>
                <li><strong>Business Information:</strong> Business name, GSTIN, address, license numbers (fertilizer, 
                seed, pesticide), dealer registration details</li>
                <li><strong>Payment Information:</strong> Processed securely through PhonePe Payment Gateway (we do not 
                store complete card details)</li>
                <li><strong>Business Data:</strong> Product catalogs, inventory records, customer information, supplier 
                details, sales transactions, purchase orders</li>
                <li><strong>Communications:</strong> Support requests, feedback, and correspondence</li>
              </ul>
            </Typography>

            <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
              2.2 Automatically Collected Information
            </Typography>
            <Typography component="div">
              <ul>
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent, click patterns</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Log Data:</strong> Access times, error logs, system activity</li>
                <li><strong>Cookies and Tracking:</strong> Session cookies, authentication tokens, preference settings</li>
              </ul>
            </Typography>

            <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
              2.3 Third-Party Information
            </Typography>
            <Typography component="div">
              <ul>
                <li><strong>Authentication:</strong> Information from Supabase authentication service</li>
                <li><strong>Payment Processing:</strong> Transaction data from PhonePe Payment Gateway</li>
                <li><strong>Analytics:</strong> Usage statistics from analytics tools</li>
              </ul>
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              3. How We Use Your Information
            </Typography>
            <Typography paragraph>
              We use the collected information for the following purposes:
            </Typography>
            <Typography component="div">
              <ul>
                <li><strong>Service Provision:</strong> To provide, maintain, and improve our inventory management platform</li>
                <li><strong>Account Management:</strong> To create and manage your account, authenticate users</li>
                <li><strong>Transaction Processing:</strong> To process payments, generate invoices, manage subscriptions</li>
                <li><strong>Communication:</strong> To send service updates, notifications, support responses</li>
                <li><strong>Compliance:</strong> To comply with GST regulations, e-invoicing requirements, legal obligations</li>
                <li><strong>Analytics:</strong> To analyze usage patterns, improve features, optimize performance</li>
                <li><strong>Security:</strong> To detect fraud, prevent abuse, ensure platform security</li>
                <li><strong>Customer Support:</strong> To respond to inquiries, troubleshoot issues, provide assistance</li>
              </ul>
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              4. Data Storage and Security
            </Typography>
            
            <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
              4.1 Data Storage
            </Typography>
            <Typography component="div">
              <ul>
                <li><strong>Database:</strong> Hosted on Supabase (PostgreSQL) with geographic redundancy</li>
                <li><strong>File Storage:</strong> Product images and documents stored in Supabase Storage</li>
                <li><strong>Backup:</strong> Regular automated backups with point-in-time recovery</li>
                <li><strong>Data Retention:</strong> Active data retained during subscription; 30 days post-cancellation</li>
              </ul>
            </Typography>

            <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
              4.2 Security Measures
            </Typography>
            <Typography component="div">
              <ul>
                <li><strong>Encryption:</strong> SSL/TLS encryption for data in transit, encryption at rest for sensitive data</li>
                <li><strong>Authentication:</strong> JWT-based authentication, secure password hashing (bcrypt)</li>
                <li><strong>Access Control:</strong> Row-Level Security (RLS) for multi-tenant data isolation</li>
                <li><strong>Authorization:</strong> Role-based access control (admin, staff, cashier)</li>
                <li><strong>Monitoring:</strong> Real-time security monitoring, error tracking via Sentry</li>
                <li><strong>Auditing:</strong> Comprehensive audit trails for all data modifications</li>
              </ul>
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              5. Data Sharing and Disclosure
            </Typography>
            
            <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
              5.1 We Share Information With:
            </Typography>
            <Typography component="div">
              <ul>
                <li><strong>Service Providers:</strong>
                  <ul>
                    <li>Supabase (database and authentication)</li>
                    <li>PhonePe (payment processing)</li>
                    <li>Vercel (hosting and deployment)</li>
                    <li>Sentry (error tracking)</li>
                  </ul>
                </li>
                <li><strong>Government Authorities:</strong> When required by law (e.g., GST authorities, tax departments)</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations, court orders, or regulatory requirements</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets (with notice)</li>
              </ul>
            </Typography>

            <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
              5.2 We Do NOT:
            </Typography>
            <Typography component="div">
              <ul>
                <li>Sell your personal information to third parties</li>
                <li>Share your business data with competitors</li>
                <li>Use your data for purposes other than those stated in this policy</li>
                <li>Share customer data across different merchant accounts (strict multi-tenant isolation)</li>
              </ul>
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              6. Your Data Rights
            </Typography>
            <Typography paragraph>
              Under applicable data protection laws, you have the following rights:
            </Typography>
            <Typography component="div">
              <ul>
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your data (subject to legal retention requirements)</li>
                <li><strong>Export:</strong> Download your business data in a portable format</li>
                <li><strong>Restriction:</strong> Limit how we process your data</li>
                <li><strong>Objection:</strong> Object to certain types of processing</li>
                <li><strong>Withdrawal:</strong> Withdraw consent at any time (where processing is based on consent)</li>
              </ul>
            </Typography>
            <Typography paragraph>
              To exercise these rights, contact us at support@krishisethu.com
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              7. Cookies and Tracking Technologies
            </Typography>
            <Typography paragraph>
              We use cookies and similar technologies to:
            </Typography>
            <Typography component="div">
              <ul>
                <li><strong>Essential Cookies:</strong> Required for authentication and core functionality</li>
                <li><strong>Preference Cookies:</strong> Remember your settings (theme, language)</li>
                <li><strong>Analytics Cookies:</strong> Understand how you use our Service</li>
                <li><strong>Session Storage:</strong> Maintain your login session</li>
              </ul>
            </Typography>
            <Typography paragraph>
              You can control cookies through your browser settings, but disabling essential cookies may affect functionality.
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              8. Multi-Tenant Data Isolation
            </Typography>
            <Typography paragraph>
              Our platform uses a multi-tenant architecture with strict data isolation:
            </Typography>
            <Typography component="div">
              <ul>
                <li>Each merchant's data is completely isolated from other merchants</li>
                <li>Row-Level Security (RLS) policies enforce data access controls at the database level</li>
                <li>Users can only access data belonging to their merchant account</li>
                <li>Cross-tenant data access is technically impossible through our application</li>
              </ul>
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              9. Third-Party Services
            </Typography>
            
            <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
              9.1 PhonePe Payment Gateway
            </Typography>
            <Typography paragraph>
              Payment processing is handled by PhonePe. When you make a payment:
            </Typography>
            <Typography component="div">
              <ul>
                <li>You are redirected to PhonePe's secure payment page</li>
                <li>PhonePe's Privacy Policy and Terms apply to payment transactions</li>
                <li>We receive transaction status and payment confirmation</li>
                <li>We do not store complete card/UPI details</li>
              </ul>
            </Typography>

            <Typography variant="h6" component="h3" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>
              9.2 Supabase
            </Typography>
            <Typography paragraph>
              Our database and authentication are powered by Supabase:
            </Typography>
            <Typography component="div">
              <ul>
                <li>Data is stored in secure PostgreSQL databases</li>
                <li>Supabase complies with SOC 2 Type II standards</li>
                <li>Data centers located in [specify region]</li>
              </ul>
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              10. Data Retention
            </Typography>
            <Typography component="div">
              <ul>
                <li><strong>Active Accounts:</strong> Data retained for the duration of your subscription</li>
                <li><strong>Cancelled Accounts:</strong> Data retained for 30 days after cancellation for recovery</li>
                <li><strong>Legal Requirements:</strong> Some data may be retained longer to comply with tax laws 
                (e.g., GST records for 6 years)</li>
                <li><strong>Anonymized Data:</strong> Aggregated, anonymized analytics may be retained indefinitely</li>
              </ul>
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              11. Children's Privacy
            </Typography>
            <Typography paragraph>
              Our Service is not intended for individuals under 18 years of age. We do not knowingly collect personal 
              information from children. If you believe we have collected information from a child, please contact us 
              immediately.
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              12. International Data Transfers
            </Typography>
            <Typography paragraph>
              Your data is primarily stored and processed in India. If data is transferred internationally, we ensure 
              appropriate safeguards are in place to protect your information in accordance with applicable laws.
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              13. Changes to Privacy Policy
            </Typography>
            <Typography paragraph>
              We may update this Privacy Policy from time to time. We will notify you of significant changes via:
            </Typography>
            <Typography component="div">
              <ul>
                <li>Email notification to your registered email address</li>
                <li>In-app notification when you log in</li>
                <li>Updated "Last Updated" date at the top of this policy</li>
              </ul>
            </Typography>
            <Typography paragraph>
              Your continued use of the Service after changes constitutes acceptance of the updated policy.
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              14. Contact Information
            </Typography>
            <Typography paragraph>
              For privacy-related questions, concerns, or requests, please contact us:
            </Typography>
            <Typography component="div">
              <ul>
                <li><strong>Email:</strong> privacy@krishisethu.com</li>
                <li><strong>Support Email:</strong> support@krishisethu.com</li>
                <li><strong>Phone:</strong> +91 [Your Phone Number]</li>
                <li><strong>Address:</strong> [Your Business Address]</li>
              </ul>
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              15. Compliance
            </Typography>
            <Typography paragraph>
              We comply with:
            </Typography>
            <Typography component="div">
              <ul>
                <li>Information Technology Act, 2000 (India)</li>
                <li>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data 
                or Information) Rules, 2011</li>
                <li>GST regulations and e-invoicing requirements</li>
                <li>Industry best practices for data security</li>
              </ul>
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Typography variant="body2" color="text.secondary" align="center">
              By using KrishiSethu Fertilizer Inventory Management System, you acknowledge that you have read and 
              understood this Privacy Policy and agree to its terms.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;
