import { Metadata } from 'next';
import GalleryGrid from '../components/gallery/GalleryGrid';

export const metadata: Metadata = {
    title: 'Gallery | Miniverse Studios',
    description: 'Explore our gallery showcasing development features and updates, as well as community submissions!'
}

const GalleryPage = () => {
    return (
        <main>
            <GalleryGrid />
        </main>
    )
}

export default GalleryPage;