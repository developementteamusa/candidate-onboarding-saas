from html import escape

import boto3

from botocore.exceptions import (
    BotoCoreError,
    ClientError,
    NoCredentialsError,
)

from app.core.config import get_settings


settings = get_settings()


def get_ses_client():
    """
    Create and return an Amazon SES client.

    Credentials are resolved through Boto3's
    standard AWS credential provider chain.
    """

    return boto3.client(
        "ses",
        region_name=settings.aws_region,
    )


def send_onboarding_invitation_email(
    to_email: str,
    candidate_name: str,
    company_name: str,
    invitation_url: str,
):
    """
    Send an onboarding invitation email using Amazon SES.

    Returns:
        str: SES MessageId

    Raises:
        RuntimeError:
            If AWS credentials are unavailable,
            SES rejects the message,
            or another AWS SDK error occurs.
    """

    ses = get_ses_client()

    safe_candidate_name = escape(
        candidate_name
    )

    safe_company_name = escape(
        company_name
    )

    safe_invitation_url = escape(
        invitation_url,
        quote=True,
    )

    subject = (
        f"Start your onboarding with "
        f"{company_name}"
    )

    text_body = (
        f"Hello {candidate_name},\n\n"
        f"Your application with "
        f"{company_name} has been approved.\n\n"
        f"You can now begin your onboarding "
        f"process using the secure link below:\n\n"
        f"{invitation_url}\n\n"
        f"This invitation is time-limited.\n\n"
        f"If you did not expect this email, "
        f"you may ignore it."
    )

    html_body = f"""
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <title>Onboarding Invitation</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
          font-family: Arial, Helvetica, sans-serif;
          color: #0f172a;
        "
      >
        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            width: 100%;
            background-color: #f8fafc;
            padding: 32px 16px;
          "
        >
          <tr>
            <td align="center">

              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  max-width: 600px;
                  background-color: #ffffff;
                  border: 1px solid #e2e8f0;
                  border-radius: 12px;
                  padding: 32px;
                "
              >

                <tr>
                  <td>
                    <p
                      style="
                        margin: 0 0 12px 0;
                        font-size: 13px;
                        font-weight: bold;
                        text-transform: uppercase;
                        color: #2563eb;
                      "
                    >
                      Candidate Onboarding
                    </p>

                    <h1
                      style="
                        margin: 0 0 20px 0;
                        font-size: 28px;
                        line-height: 1.25;
                        color: #0f172a;
                      "
                    >
                      Your application has been approved
                    </h1>

                    <p
                      style="
                        margin: 0 0 16px 0;
                        font-size: 16px;
                        line-height: 1.6;
                        color: #334155;
                      "
                    >
                      Hello {safe_candidate_name},
                    </p>

                    <p
                      style="
                        margin: 0 0 16px 0;
                        font-size: 16px;
                        line-height: 1.6;
                        color: #334155;
                      "
                    >
                      {safe_company_name} has approved
                      your application.
                    </p>

                    <p
                      style="
                        margin: 0 0 24px 0;
                        font-size: 16px;
                        line-height: 1.6;
                        color: #334155;
                      "
                    >
                      You can now begin your onboarding
                      process by selecting the secure
                      button below.
                    </p>

                    <p
                      style="
                        margin: 0 0 24px 0;
                      "
                    >
                      <a
                        href="{safe_invitation_url}"
                        style="
                          display: inline-block;
                          background-color: #0f172a;
                          color: #ffffff;
                          text-decoration: none;
                          font-size: 16px;
                          font-weight: bold;
                          padding: 14px 22px;
                          border-radius: 8px;
                        "
                      >
                        Start onboarding
                      </a>
                    </p>

                    <p
                      style="
                        margin: 0 0 16px 0;
                        font-size: 14px;
                        line-height: 1.6;
                        color: #64748b;
                      "
                    >
                      This invitation is time-limited.
                    </p>

                    <p
                      style="
                        margin: 0;
                        font-size: 13px;
                        line-height: 1.6;
                        color: #94a3b8;
                      "
                    >
                      If you did not expect this email,
                      you may safely ignore it.
                    </p>
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </body>
    </html>
    """

    try:
        response = ses.send_email(
            Source=settings.ses_from_email,

            Destination={
                "ToAddresses": [
                    to_email,
                ],
            },

            Message={
                "Subject": {
                    "Data": subject,
                    "Charset": "UTF-8",
                },

                "Body": {
                    "Text": {
                        "Data": text_body,
                        "Charset": "UTF-8",
                    },

                    "Html": {
                        "Data": html_body,
                        "Charset": "UTF-8",
                    },
                },
            },
        )

        message_id = response.get(
            "MessageId"
        )

        if not message_id:
            raise RuntimeError(
                "Amazon SES accepted the request "
                "but did not return a MessageId."
            )

        print(
            "SES email sent successfully. "
            f"MessageId: {message_id}"
        )

        return message_id

    except NoCredentialsError as exc:
        print(
            "AWS credentials are unavailable."
        )

        raise RuntimeError(
            "AWS credentials are not configured."
        ) from exc

    except ClientError as exc:
        error = exc.response.get(
            "Error",
            {},
        )

        error_code = error.get(
            "Code",
            "Unknown",
        )

        error_message = error.get(
            "Message",
            "Unknown Amazon SES error",
        )

        print(
            "Amazon SES ClientError:"
        )

        print(
            f"Code: {error_code}"
        )

        print(
            f"Message: {error_message}"
        )

        print(
            f"Recipient: {to_email}"
        )

        print(
            f"Sender: "
            f"{settings.ses_from_email}"
        )

        print(
            f"Region: "
            f"{settings.aws_region}"
        )

        raise RuntimeError(
            "Unable to send onboarding "
            "invitation email."
        ) from exc

    except BotoCoreError as exc:
        print(
            "AWS SDK BotoCoreError:"
        )

        print(
            str(exc)
        )

        raise RuntimeError(
            "Unable to communicate with "
            "Amazon SES."
        ) from exc

    except Exception as exc:
        print(
            "Unexpected SES integration error:"
        )

        print(
            str(exc)
        )

        raise