import { CreateEmailOptions, Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = (options: Omit<CreateEmailOptions, "from">) => {
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    ...(options as CreateEmailOptions),
  });
};
