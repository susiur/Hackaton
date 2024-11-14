import { signIn } from '@/auth';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';

export function SignIn() {
  return (
    <form
      action={async () => {
        'use server';
        const callbackUrl = "/";
        await signIn('auth0', { callbackUrl });
      }}
    >
      <Button
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 ease-in-out transform hover:scale-105 flex items-center justify-center"
        type="submit"
      >
        Ingresa
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </form>
  );
}
