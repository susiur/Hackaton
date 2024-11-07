import { SignIn } from '@/components/session/SignIn';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, CreditCard, Store } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 overflow-hidden relative">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md p-4 relative z-10">
        <Card className="w-full bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg">
          <CardHeader className="pb-0">
            <CardTitle className="text-3xl font-bold text-center text-blue-700">
              Tenderos Crediticos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 p-3 rounded-full">
                <Store className="w-12 h-12 text-blue-500" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">
              ¡Bienvenido, Tendero!
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Gestiona tu tienda y créditos con facilidad. ¿Listo para impulsar
              tu negocio?
            </p>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <SignIn />
          </CardFooter>
        </Card>
      </div>

      {/* Floating credit cards */}
      <div className="absolute bottom-10 right-10 transform rotate-12 animate-float">
        <CreditCard className="w-16 h-16 text-white opacity-50" />
      </div>
      <div className="absolute top-10 left-10 transform -rotate-12 animate-float animation-delay-2000">
        <CreditCard className="w-12 h-12 text-white opacity-30" />
      </div>
    </div>
  );
}
