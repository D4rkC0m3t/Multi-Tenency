import { useState } from 'react';
import { AuthPageComponent } from './AuthPageComponent';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <AuthPageComponent>
      {isLogin ? <LoginForm onToggleToSignup={() => setIsLogin(false)} /> : <SignUpForm />}
      
      <div className="mt-6 space-y-4 text-center">
        <div>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-green-100 hover:text-white text-sm underline"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </AuthPageComponent>
  );
}
