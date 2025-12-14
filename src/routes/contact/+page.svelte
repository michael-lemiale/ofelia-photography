<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<div class="contact">
	<div class="contact-content">
		<h1>Get In Touch</h1>
		<p class="intro">
			Have a question or interested in booking a session? I'd love to hear from you. Fill out the
			form below and I'll get back to you as soon as possible.
		</p>

		{#if form?.success}
			<div class="success-message">
				<p>Thank you for your message! I'll get back to you soon.</p>
			</div>
		{/if}

		{#if form?.error}
			<div class="error-message">
				<p>{form.error}</p>
			</div>
		{/if}

		<form method="POST" use:enhance>
			<div class="form-group">
				<label for="name">Name *</label>
				<input type="text" id="name" name="name" required />
			</div>

			<div class="form-group">
				<label for="email">Email *</label>
				<input type="email" id="email" name="email" required />
			</div>

			<div class="form-group">
				<label for="phone">Phone</label>
				<input type="tel" id="phone" name="phone" />
			</div>

			<div class="form-group">
				<label for="subject">Subject *</label>
				<input type="text" id="subject" name="subject" required />
			</div>

			<div class="form-group">
				<label for="message">Message *</label>
				<textarea id="message" name="message" rows="6" required></textarea>
			</div>

			<button type="submit" class="submit-btn">Send Message</button>
		</form>
	</div>
</div>

<style>
	.contact {
		max-width: 700px;
		margin: 0 auto;
		padding: 3rem 2rem;
	}

	.contact-content {
		text-align: left;
	}

	h1 {
		font-size: 2.5rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: #111;
	}

	.intro {
		font-size: 1.1rem;
		color: #666;
		margin-bottom: 2rem;
		line-height: 1.6;
	}

	.success-message {
		background-color: #d4edda;
		border: 1px solid #c3e6cb;
		color: #155724;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 2rem;
	}

	.success-message p {
		margin: 0;
	}

	.error-message {
		background-color: #f8d7da;
		border: 1px solid #f5c6cb;
		color: #721c24;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 2rem;
	}

	.error-message p {
		margin: 0;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-weight: 500;
		color: #333;
		font-size: 0.95rem;
	}

	input,
	textarea {
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 6px;
		font-size: 1rem;
		font-family: inherit;
		transition: border-color 0.2s ease;
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: #111;
	}

	textarea {
		resize: vertical;
		min-height: 120px;
	}

	.submit-btn {
		background-color: #111;
		color: #fff;
		padding: 1rem 2rem;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 0.2s ease, transform 0.2s ease;
		letter-spacing: 0.05em;
	}

	.submit-btn:hover {
		background-color: #333;
		transform: translateY(-2px);
	}

	.submit-btn:active {
		transform: translateY(0);
	}

	@media (max-width: 768px) {
		.contact {
			padding: 2rem 1rem;
		}

		h1 {
			font-size: 2rem;
		}

		.intro {
			font-size: 1rem;
		}
	}
</style>
