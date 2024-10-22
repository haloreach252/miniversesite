import { Metadata } from "next"
import SignInForm from "@/app/components/auth/SignInForm";

export const metadata: Metadata = {
    title: 'Sign In | Miniverse Studios',
    description: 'Access your account on Miniverse Studios. Sign in to continue enjoying our services'
}

const SignInPage = () => {
    return (
        <main>
            <SignInForm />
        </main>
    )
}

export default SignInPage;