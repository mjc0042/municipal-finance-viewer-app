import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/http/auth/api';
import { usePasswordValidator } from '@/hooks/password-validator';

export default function Register() {
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    organization: '',
    password: '',
    password_confirmation: ''
  });

  const { errors, validatePassword } = usePasswordValidator();

  // Add error message state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      setLocation('/login');
    },
    onError: (res: any) => {
      let message = "Registration failed.";
      if (res.status === 403) {
        setErrorMessage("Site Error. Please refresh.");
      }
      else if (res.status === 422) {
        if (res.response?.data?.message) {
          message = res.response.data.message;
        }
        if (res.response?.data?.detail) {
          const emailError = res.response.data.detail.find(
            (err: any) => err.loc && err.loc.includes("email")
          );
          if (emailError) {
            message = emailError.msg;
          }
        }
        setErrorMessage(message)
      }
      else {
        setErrorMessage("Registration failed.")
      }
      console.error('Registration failed:', res.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  // Determine if the submit button should be disabled
  const isSubmitDisabled = formData.password === "" || registerMutation.isPending || errors.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Show error message above form */}
          {errorMessage && (
            <div className="text-sm mb-4 p-3 bg-red-100 text-red-700 rounded text-center">
              <p>{errorMessage}</p>
              {errorMessage.includes("refresh") && (
                <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
              )}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Input
                type="text"
                placeholder="First Name *"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Input
                type="text"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
            <div>
              <Input
                type="text"
                placeholder="Organization"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password *"
                value={formData.password}
                onChange={(e) => {
                  const newPassword = e.target.value;
                  setFormData({ ...formData, password: newPassword });
                  validatePassword(newPassword, formData.password_confirmation);
                }}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password *"
                value={formData.password_confirmation}
                onChange={(e) => {
                  const newConfirm = e.target.value;
                  setFormData({ ...formData, password_confirmation: newConfirm });
                  validatePassword(formData.password, newConfirm);
                }}
                required
              />
            </div>
            <div>
            {/* Show validation errors */}
            {errors.length > 0 && (
              <ul style={{ color: "red" }}>
                {errors.map((err, idx) => (
                  <li className="text-xs text-red-500" key={idx}>{err}</li>
                ))}
              </ul>
            )}
            </div>
            <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-700" disabled={isSubmitDisabled}>
              {registerMutation.isPending ? 'Creating Account...' : 'Register'}
            </Button>
            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button type="button" onClick={() => setLocation('/login')} className="text-teal hover:underline">
                Login
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}