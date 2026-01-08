const baseTemplate = (title: string, body: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f6f8;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .header {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 16px;
      color: #333;
    }
    .content {
      font-size: 14px;
      color: #555;
      line-height: 1.6;
    }
    .footer {
      margin-top: 24px;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
    .status {
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">${title}</div>
    <div class="content">${body}</div>
    <div class="footer">
      Appointment System • Please do not reply to this email
    </div>
  </div>
</body>
</html>
`;

export const appointmentCreatedHtml = (
  clientName: string,
  date: string,
  time: string,
) => ({
  subject: 'New Appointment Request',
  html: baseTemplate(
    'New Appointment Request',
    `
      <p>You have received a new appointment request.</p>
      <p>
        <strong>Client:</strong> ${clientName}<br/>
        <strong>Date:</strong> ${date}<br/>
        <strong>Time:</strong> ${time}
      </p>
      <p>Please log in to your dashboard to accept or reject the appointment.</p>
    `,
  ),
});
export const appointmentStatusHtml = (
  status: 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED',
  otherPartyName: string,
  date: string,
  time: string,
) => ({
  subject: `Appointment ${status}`,
  html: baseTemplate(
    `Appointment ${status}`,
    `
      <p>
        Your appointment with 
        <strong>${otherPartyName}</strong> has been 
        <span class="status">${status}</span>.
      </p>
      <p>
        <strong>Date:</strong> ${date}<br/>
        <strong>Time:</strong> ${time}
      </p>
    `,
  ),
});
