import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'About Us | Miniverse Studios',
    description: 'Learn more about Miniverse Studios, our mission, values, history, and the team behind it all!'
}

const AboutPage = () => {
    return (
        <section className="container mx-auto my-8">
            <h1 className="text-3xl font-bold mb-4">About Us</h1>
            <div className="space-y-4">
                <p>
                    {/* Company detailed information */}
                    Miniverse Studios was founded in 2020 with the mission to create games that are fun and enjoyable
                </p>
                <h2 className="text-2xl font-semibold">Our History</h2>
                <p>
                    {/* Company History */}
                    Since starting the company, it&apos;s been just one person making everything. Our main project Ebon Gates was first conceived in late 2019 after the release of World of Warcraft: Classic.<br />We wanted to build a game that captured the fun and exploration of early MMORPGs. In october of 2024, we began work on another game that would help us generate revenue and fun called Eldritch Dawn.
                </p>
                {/* 
                <h2 className='text-2xl font-semibold'>Mission & Vision</h2>
                <p>
                    {/* Mission and Vision statement */}{/*
                    Our mission is to push the boundaries of gaming, delivering unforgettable experiences. Our vision is to become a leading name in the gaming industry, known for innovation and quality.
                </p>
                {/**/}
            </div>
        </section>
    )
}

export default AboutPage;