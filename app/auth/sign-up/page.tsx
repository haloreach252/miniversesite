import { Metadata } from 'next';
import SignUpForm from '@/app/components/auth/SignUpForm';

export const metadata: Metadata = {
    title: 'Sign Up | Miniverse Studios',
    description: 'Create a new account on Miniverse Studios. Join us and start enjoying our features today!'
}

const SignUpPage = () => {
    return (
        <main>
            <SignUpForm />
        </main>
    )
}

export default SignUpPage;