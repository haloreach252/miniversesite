import Image from 'next/image';
import styles from '../../styles/components/Logo.module.css'

export default function Logo() {
    return (
        <div className={styles.logoContainer}>
            <Image
                src="/logo.png"
                alt="Miniverse Studios Logo"
                width={150}
                height={150}
                className={styles.logoImage}
            />
        </div>
    )
}