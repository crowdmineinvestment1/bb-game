'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Mail, Lock, User } from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onOpenLogin,
}) => {
  const { register, isLoading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!username.trim() || !email.trim() || !password.trim()) {
      setValidationError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    const result = await register({ username, email, password });
    if (result.success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Account" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {(error || validationError) && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold p-3 rounded-lg text-center animate-shake">
            {error || validationError}
          </div>
        )}

        <Input
          label="Username"
          type="text"
          placeholder="johndoe"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          leftIcon={<User size={16} />}
          disabled={isLoading}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail size={16} />}
          disabled={isLoading}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock size={16} />}
          disabled={isLoading}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          leftIcon={<Lock size={16} />}
          disabled={isLoading}
        />

        <Button 
          type="submit" 
          variant="primary" 
          className="w-full font-bold py-2.5" 
          isLoading={isLoading}
        >
          CREATE ACCOUNT
        </Button>

        <p className="text-center text-xs font-semibold text-gray-500 mt-6">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onOpenLogin}
            className="text-accent hover:underline focus:outline-none"
          >
            Log in here
          </button>
        </p>
      </form>
    </Modal>
  );
};
