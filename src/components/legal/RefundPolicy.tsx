import React from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const RefundPolicy: React.FC = () => {
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
            Refund and Cancellation Policy
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Last Updated: October 22, 2025
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ '& h2': { mt: 4, mb: 2 }, '& p': { mb: 2 }, '& ul': { mb: 2, pl: 3 } }}>
            <Typography variant="h5" component="h2" fontWeight="bold">
              1. Overview
            </Typography>
            <Typography paragraph>
              This Refund and Cancellation Policy outlines the terms for subscription cancellations, refunds, and 
              payment disputes for KrishiSethu Fertilizer Inventory Management System.
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              2. Subscription Cancellation
            </Typography>
            <Typography paragraph>
              <strong>2.1 Cancellation Process:</strong>
            </Typography>
            <Typography component="div">
              <ul>
                <li>You may cancel your subscription at any time through your account settings</li>
                <li>Cancellation requests are processed immediately</li>
                <li>Your access continues until the end of the current billing period</li>
                <li>No partial refunds for unused time in the current billing cycle</li>
              </ul>
            </Typography>
            <Typography paragraph>
              <strong>2.2 Auto-Renewal Cancellation:</strong>
            </Typography>
            <Typography component="div">
              <ul>
                <li>Cancel auto-renewal at least 24 hours before the next billing date</li>
                <li>If cancelled after renewal payment, the new billing period applies</li>
              </ul>
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              3. Refund Eligibility
            </Typography>
            <Typography paragraph>
              <strong>3.1 7-Day Money-Back Guarantee (First-Time Subscribers):</strong>
            </Typography>
            <Typography component="div">
              <ul>
                <li>Full refund available within 7 days of first subscription purchase</li>
                <li>Applies only to first-time subscribers</li>
                <li>Request must be submitted via email to support@krishisethu.com</li>
                <li>Refund processed within 7-10 business days</li>
              </ul>
            </Typography>

            <Typography paragraph>
              <strong>3.2 Non-Refundable Situations:</strong>
            </Typography>
            <Typography component="div">
              <ul>
                <li>Subscription renewals (after the first 7 days)</li>
                <li>Partial month/year subscriptions</li>
                <li>Account termination due to Terms of Service violations</li>
                <li>Requests made after 7 days of initial purchase</li>
                <li>Subscriptions purchased at discounted rates</li>
              </ul>
            </Typography>

            <Typography paragraph>
              <strong>3.3 Service Issues:</strong>
            </Typography>
            <Typography paragraph>
              If you experience technical issues preventing service use:
            </Typography>
            <Typography component="div">
              <ul>
                <li>Contact support immediately at support@krishisethu.com</li>
                <li>We will work to resolve issues within 48 hours</li>
                <li>Refunds may be considered on a case-by-case basis for unresolved critical issues</li>
              </ul>
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              4. Refund Process
            </Typography>
            <Typography paragraph>
              <strong>4.1 How to Request a Refund:</strong>
            </Typography>
            <Typography component="div">
              <ul>
                <li>Email support@krishisethu.com with subject "Refund Request"</li>
                <li>Include: Account email, subscription details, reason for refund</li>
                <li>Provide transaction ID from PhonePe payment confirmation</li>
              </ul>
            </Typography>

            <Typography paragraph>
              <strong>4.2 Refund Timeline:</strong>
            </Typography>
            <Typography component="div">
              <ul>
                <li>Request review: 2-3 business days</li>
                <li>Approval notification via email</li>
                <li>Refund processing: 7-10 business days</li>
                <li>Bank/UPI credit: Additional 3-5 business days (depends on payment method)</li>
              </ul>
            </Typography>

            <Typography paragraph>
              <strong>4.3 Refund Method:</strong>
            </Typography>
            <Typography component="div">
              <ul>
                <li>Refunds issued to original payment method via PhonePe</li>
                <li>For UPI payments: Refunded to original UPI ID</li>
                <li>For card payments: Refunded to original card</li>
                <li>For wallet payments: Refunded to original wallet</li>
              </ul>
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              5. Payment Failures
            </Typography>
            <Typography paragraph>
              <strong>5.1 Failed Transactions:</strong>
            </Typography>
            <Typography component="div">
              <ul>
                <li>If payment is deducted but subscription not activated, contact support immediately</li>
                <li>Provide transaction ID and screenshot of payment confirmation</li>
                <li>We will investigate and activate subscription or process refund within 48 hours</li>
              </ul>
            </Typography>

            <Typography paragraph>
              <strong>5.2 Duplicate Charges:</strong>
            </Typography>
            <Typography component="div">
              <ul>
                <li>If charged multiple times for single transaction, contact support</li>
                <li>Duplicate charges will be refunded within 7-10 business days after verification</li>
              </ul>
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              6. Chargebacks and Disputes
            </Typography>
            <Typography paragraph>
              <strong>6.1 Before Filing a Chargeback:</strong>
            </Typography>
            <Typography component="div">
              <ul>
                <li>Please contact us first at support@krishisethu.com</li>
                <li>Most issues can be resolved quickly without chargeback</li>
                <li>Chargebacks may result in immediate account suspension</li>
              </ul>
            </Typography>

            <Typography paragraph>
              <strong>6.2 Chargeback Consequences:</strong>
            </Typography>
            <Typography component="div">
              <ul>
                <li>Account may be suspended pending investigation</li>
                <li>Access to data may be restricted</li>
                <li>If chargeback is found invalid, account may be permanently terminated</li>
              </ul>
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              7. Downgrade Policy
            </Typography>
            <Typography component="div">
              <ul>
                <li>You may downgrade to a lower-tier plan at any time</li>
                <li>Downgrade takes effect at the next billing cycle</li>
                <li>No refund for difference between plans in current cycle</li>
                <li>Features will be adjusted according to new plan</li>
              </ul>
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              8. Upgrade Policy
            </Typography>
            <Typography component="div">
              <ul>
                <li>Upgrades take effect immediately</li>
                <li>Prorated charges for remaining days in current cycle</li>
                <li>New billing cycle starts from upgrade date</li>
              </ul>
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              9. Data Retention After Cancellation
            </Typography>
            <Typography component="div">
              <ul>
                <li>Data retained for 30 days after cancellation</li>
                <li>You can export your data during this period</li>
                <li>After 30 days, data may be permanently deleted</li>
                <li>Reactivation within 30 days: Full data restoration</li>
              </ul>
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              10. Special Circumstances
            </Typography>
            <Typography paragraph>
              <strong>10.1 Force Majeure:</strong>
            </Typography>
            <Typography paragraph>
              No refunds for service interruptions due to circumstances beyond our control (natural disasters, 
              government actions, internet outages, etc.).
            </Typography>

            <Typography paragraph>
              <strong>10.2 Account Termination by Us:</strong>
            </Typography>
            <Typography component="div">
              <ul>
                <li>If we terminate your account for Terms violation: No refund</li>
                <li>If we discontinue the service: Prorated refund for remaining period</li>
              </ul>
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              11. Contact for Refund Requests
            </Typography>
            <Typography paragraph>
              For refund requests or payment issues:
            </Typography>
            <Typography component="div">
              <ul>
                <li><strong>Email:</strong> support@krishisethu.com</li>
                <li><strong>Subject Line:</strong> "Refund Request - [Your Account Email]"</li>
                <li><strong>Phone:</strong> +91 [Your Phone Number] (Mon-Fri, 9 AM - 6 PM IST)</li>
              </ul>
            </Typography>

            <Typography paragraph>
              <strong>Required Information:</strong>
            </Typography>
            <Typography component="div">
              <ul>
                <li>Account email address</li>
                <li>Transaction ID from PhonePe</li>
                <li>Date of transaction</li>
                <li>Amount charged</li>
                <li>Reason for refund request</li>
              </ul>
            </Typography>

            <Typography variant="h5" component="h2" fontWeight="bold">
              12. Changes to Refund Policy
            </Typography>
            <Typography paragraph>
              We reserve the right to modify this Refund Policy at any time. Changes will be communicated via email 
              and will apply to transactions made after the effective date of the change.
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Typography variant="body2" color="text.secondary" align="center">
              For questions about this Refund Policy, please contact support@krishisethu.com
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RefundPolicy;
