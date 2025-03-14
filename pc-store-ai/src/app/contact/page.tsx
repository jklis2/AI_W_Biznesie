"use client"
import PageHeader from '@/components/ui/PageHeader';
import Input from '@/components/ui/Input';
import { useState, FormEvent } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.message) newErrors.message = 'Message is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // TODO: Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div>
      <PageHeader backgroundImage="/headerBackgrounds/home.jpg" title="Contact">
        <div className="py-5 px-5 w-full">
          <h2 className="text-4xl font-bold">Contact Us</h2>
          <p className="mt-2 text-gray-600">Have a question? We&apos;d love to hear from you.</p>
        </div>
      </PageHeader>
      
      <div className="max-w-2xl mx-auto py-8 px-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            placeholder="Your name"
          />
          
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            placeholder="your.email@example.com"
          />
          
          <Input
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            error={errors.subject}
            placeholder="What is this about?"
          />
          
          <Input
            label="Message"
            name="message"
            variant="textarea"
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            error={errors.message}
            placeholder="Your message"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}