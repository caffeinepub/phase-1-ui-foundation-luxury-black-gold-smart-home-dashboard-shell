import { useState } from 'react';
import { Mail, Phone, HelpCircle, Send, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { GlassCard } from '../components/effects/GlassCard';
import { CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { useSubmitSupportTicket } from '../hooks/useQueries';

interface KnowledgeBaseItem {
  id: string;
  problem: string;
  solution: string;
}

const knowledgeBaseData: KnowledgeBaseItem[] = [
  {
    id: '1',
    problem: 'Device not responding to commands',
    solution: 'First, check if the device is powered on and connected to your network. Try toggling the device off and on again. If the issue persists, restart your smart home hub and ensure your internet connection is stable.',
  },
  {
    id: '2',
    problem: 'Unable to access the 3D virtual home view',
    solution: 'The 3D view requires WebGL support in your browser. Ensure you are using a modern browser (Chrome, Firefox, Safari, or Edge) with hardware acceleration enabled. Try clearing your browser cache and reloading the page.',
  },
  {
    id: '3',
    problem: 'Secret Key not working',
    solution: 'Verify that you are entering the correct Secret Key without any extra spaces. The key is case-sensitive. If you have lost your key, you can find it in the Settings page under the Security section.',
  },
  {
    id: '4',
    problem: 'Brightness control not working',
    solution: 'Ensure the device supports brightness control. Some devices only support on/off functionality. If your device supports dimming, try setting the brightness to a different value and wait a few seconds for the change to take effect.',
  },
  {
    id: '5',
    problem: 'Dashboard statistics not updating',
    solution: 'The dashboard statistics update automatically every few seconds. If they appear frozen, try refreshing the page. Ensure you have a stable internet connection and that your browser is not blocking JavaScript.',
  },
  {
    id: '6',
    problem: 'QR code scanner not working',
    solution: 'The QR scanner requires camera permissions. Check your browser settings to ensure camera access is allowed for this site. On mobile devices, make sure no other app is using the camera.',
  },
];

export function SupportInfoPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const submitTicketMutation = useSubmitSupportTicket();

  const filteredKnowledgeBase = knowledgeBaseData.filter((item) =>
    item.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.solution.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Include name and email in the description since backend only accepts subject + description
      const fullDescription = `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`;
      
      await submitTicketMutation.mutateAsync({
        subject: formData.subject,
        description: fullDescription,
      });

      // Show success message
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      setFormErrors({});

      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to submit support ticket:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Support & Info</h2>
        <p className="mt-2 text-muted-foreground">
          Get help, find answers, and contact our support team
        </p>
      </div>

      {/* Support Sections */}
      <div className="space-y-4">
        {/* About Us */}
        <GlassCard disableTilt>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <HelpCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>About Us</CardTitle>
                <CardDescription>Contact information and support details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <a
                    href="mailto:Wesaamsef2@gmail.com"
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    Wesaamsef2@gmail.com
                  </a>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <a
                    href="tel:01225246291"
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    01225246291
                  </a>
                </div>
              </div>
            </div>

            <Separator />

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm text-muted-foreground">
                Our support team is available to help you with any questions or issues you may have.
                Feel free to reach out via email or phone during business hours.
              </p>
            </div>
          </CardContent>
        </GlassCard>

        {/* Knowledge Base */}
        <GlassCard disableTilt>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Problems & Solutions</CardTitle>
                <CardDescription>Find answers to common questions and troubleshooting tips</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="kb-search">Search Knowledge Base</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="kb-search"
                  placeholder="Search for problems or solutions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Separator />

            {/* Knowledge Base Items */}
            {filteredKnowledgeBase.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {filteredKnowledgeBase.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="text-left hover:text-primary">
                      {item.problem}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.solution}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  No results found for "{searchQuery}"
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Try a different search term or browse all topics
                </p>
              </div>
            )}
          </CardContent>
        </GlassCard>

        {/* Support Ticket Form */}
        <GlassCard disableTilt>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Send className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Support Ticket</CardTitle>
                <CardDescription>Submit a request for personalized assistance</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {showSuccess ? (
              <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Support Ticket Submitted Successfully!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Thank you for contacting us. Our support team will review your request and get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="ticket-name">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ticket-name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={formErrors.name ? 'border-destructive' : ''}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-destructive">{formErrors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="ticket-email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ticket-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={formErrors.email ? 'border-destructive' : ''}
                  />
                  {formErrors.email && (
                    <p className="text-xs text-destructive">{formErrors.email}</p>
                  )}
                </div>

                {/* Subject Field */}
                <div className="space-y-2">
                  <Label htmlFor="ticket-subject">
                    Subject <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="ticket-subject"
                    placeholder="Brief description of your issue"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className={formErrors.subject ? 'border-destructive' : ''}
                  />
                  {formErrors.subject && (
                    <p className="text-xs text-destructive">{formErrors.subject}</p>
                  )}
                </div>

                {/* Message Field */}
                <div className="space-y-2">
                  <Label htmlFor="ticket-message">
                    Message <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="ticket-message"
                    placeholder="Describe your issue in detail..."
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className={formErrors.message ? 'border-destructive' : ''}
                    rows={6}
                  />
                  {formErrors.message && (
                    <p className="text-xs text-destructive">{formErrors.message}</p>
                  )}
                </div>

                {/* Error Message */}
                {submitTicketMutation.isError && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
                    <p className="text-sm text-destructive">
                      Failed to submit support ticket. Please try again or contact us directly via email or phone.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold shadow-gold-glow-sm"
                  disabled={submitTicketMutation.isPending}
                >
                  {submitTicketMutation.isPending ? (
                    <>
                      <span className="mr-2">Submitting...</span>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Support Ticket
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  All fields marked with <span className="text-destructive">*</span> are required
                </p>
              </form>
            )}
          </CardContent>
        </GlassCard>
      </div>
    </div>
  );
}
