import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name');
		const email = data.get('email');
		const phone = data.get('phone');
		const subject = data.get('subject');
		const message = data.get('message');

		// Validate required fields
		if (!name || !email || !subject || !message) {
			return fail(400, { error: 'Please fill in all required fields.' });
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email.toString())) {
			return fail(400, { error: 'Please enter a valid email address.' });
		}

		try {
			// Create transporter with ProtonMail SMTP settings
			const transporter = nodemailer.createTransport({
				host: 'smtp.protonmail.ch',
				port: 587,
				secure: false, // Use STARTTLS
				auth: {
					user: env.SMTP_USER || '',
					pass: env.SMTP_PASS || ''
				}
			});

			// Email content
			const mailOptions = {
				from: env.SMTP_USER,
				to: 'info@ofeliaemephoto.com',
				subject: `Contact Form: ${subject}`,
				replyTo: email.toString(),
				text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\nMessage:\n${message}`,
				html: `
					<h3>New Contact Form Submission</h3>
					<p><strong>Name:</strong> ${name}</p>
					<p><strong>Email:</strong> ${email}</p>
					<p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
					<p><strong>Subject:</strong> ${subject}</p>
					<p><strong>Message:</strong></p>
					<p>${message.toString().replace(/\n/g, '<br>')}</p>
				`
			};

			// Send email
			await transporter.sendMail(mailOptions);

			return { success: true };
		} catch (error) {
			console.error('Error sending email:', error);
			return fail(500, { error: 'Failed to send message. Please try again later.' });
		}
	}
} satisfies Actions;
