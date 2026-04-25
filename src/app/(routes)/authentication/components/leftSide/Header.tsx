import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
  isSignUp: boolean;
  isForgot: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isSignUp, isForgot }) => {
  return (
    <div className="text-center">
      <div className="mb-8">
        <Link href="/" className="block">
          <div className="relative w-24 h-24 mx-auto shadow-2xl rounded-full transform rotate-3 hover:rotate-0 transition-transform duration-300 cursor-pointer overflow-hidden ring-4 ring-white">
            <Image
              src="/Logo/Circular-1.png"
              alt="E-Invoice Pro"
              fill
              className="object-cover"
              priority
            />
          </div>
        </Link>
      </div>
      <h1 className="text-5xl font-black leading-tight tracking-tight mb-3 font-sans">
        <span className="text-brand-gradient">
          {isForgot ? 'Reset Password' : isSignUp ? 'Join Us' : 'Welcome'}
        </span>
      </h1>
      <p className="text-gray-600 text-base font-medium leading-relaxed">
        {isForgot
          ? 'Set a new password for your account'
          : isSignUp
          ? 'Start your e-invoicing transformation today'
          : 'Continue your e-invoicing journey'}
      </p>
    </div>
  );
};
