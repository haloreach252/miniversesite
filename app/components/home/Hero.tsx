import Image from 'next/image';
import Logo from '../common/CircleLogo';

const Hero = () => {
    return (
        <section className='relative h-96'>
            <Image
                src="/hero-image.jpg"
                alt="Miniverse Studios Logo"
                layout="fill"
                objectFit="cover"
                priority
            />
            <div className='absolute inset-0 bg-black opacity-50'></div>
            <div className='absolute inset-0 flex flex-col items-center justify-center text-white'>
                <Logo />
                <h1 className='text-4xl mt-4'>Welcome to Miniverse Studios</h1>
            </div>
        </section>
    )
}

export default Hero;