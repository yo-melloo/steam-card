"use client";

import Link from 'next/link';

export default function SecretDeck() {
  return (
    <main className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h1 className="logo-title" style={{ justifyContent: 'center' }}>Deck Secreto</h1>
      <p className="subtitle" style={{ marginBottom: '40px' }}>Em breve - Seus cards favoritos salvos e organizados</p>
      <Link href="/" className="secret-back-link">
        ← Voltar para a Biblioteca
      </Link>
    </main>
  );
}
