import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '../components/layout/Footer';

describe('Footer', () => {
  // ── 1. Marca ─────────────────────────────────────────────────────────

  it('renderiza el nombre de la marca "Rock Merch & Roll" como h3', () => {
    render(<Footer />);
    const brand = screen.getByRole('heading', { name: 'Rock Merch & Roll', level: 3 });
    expect(brand).toBeInTheDocument();
  });

  it('renderiza la descripción de la marca', () => {
    render(<Footer />);
    expect(
      screen.getByText(/El santuario del merchandising de rock/)
    ).toBeInTheDocument();
  });

  // ── 2. Contacto ───────────────────────────────────────────────────────

  it('renderiza la sección "Contacto" como h4', () => {
    render(<Footer />);
    const contacto = screen.getByRole('heading', { name: 'Contacto', level: 4 });
    expect(contacto).toBeInTheDocument();
  });

  it('renderiza el teléfono (+54 11 5555-0123)', () => {
    render(<Footer />);
    expect(screen.getByText('+54 11 5555-0123')).toBeInTheDocument();
  });

  it('renderiza el email (info@rockmerch.com.ar)', () => {
    render(<Footer />);
    expect(screen.getByText('info@rockmerch.com.ar')).toBeInTheDocument();
  });

  it('renderiza la dirección (Av. Corrientes 1234, CABA, Argentina)', () => {
    render(<Footer />);
    expect(screen.getByText('Av. Corrientes 1234, CABA, Argentina')).toBeInTheDocument();
  });

  // ── 3. Redes sociales ─────────────────────────────────────────────────

  it('renderiza la sección "Seguinos" como h4', () => {
    render(<Footer />);
    const seguinos = screen.getByRole('heading', { name: 'Seguinos', level: 4 });
    expect(seguinos).toBeInTheDocument();
  });

  it('renderiza 4 íconos de redes sociales sin hipervínculos', () => {
    const { container } = render(<Footer />);
    const socialIcons = container.querySelectorAll('.rounded-full.bg-gray-800');
    expect(socialIcons).toHaveLength(4);
    socialIcons.forEach((icon) => {
      expect(icon.tagName).toBe('SPAN');
      expect(icon.closest('a')).toBeNull();
    });
  });

  it('cada ícono social tiene la clase bx correcta', () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('.bxl-facebook')).toBeInTheDocument();
    expect(container.querySelector('.bxl-instagram')).toBeInTheDocument();
    expect(container.querySelector('.bxl-twitter')).toBeInTheDocument();
    expect(container.querySelector('.bxl-youtube')).toBeInTheDocument();
  });

  // ── 4. Contacto sin hipervínculos ─────────────────────────────────────

  it('el teléfono se muestra como texto plano sin hipervínculo', () => {
    render(<Footer />);
    const phone = screen.getByText('+54 11 5555-0123');
    expect(phone.tagName).toBe('SPAN');
    expect(phone.closest('a')).toBeNull();
  });

  it('el email se muestra como texto plano sin hipervínculo', () => {
    render(<Footer />);
    const email = screen.getByText('info@rockmerch.com.ar');
    expect(email.tagName).toBe('SPAN');
    expect(email.closest('a')).toBeNull();
  });

  // ── 5. Créditos ───────────────────────────────────────────────────────

  it('renderiza "Designed & Developed by Bruno Pezman"', () => {
    render(<Footer />);
    expect(
      screen.getByText(/Designed & Developed by Bruno Pezman/i)
    ).toBeInTheDocument();
  });
});
