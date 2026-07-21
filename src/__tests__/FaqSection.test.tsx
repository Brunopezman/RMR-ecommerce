import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FaqSection } from '../components/layout/FaqSection';

const QUESTIONS = [
  '¿Cuánto tarda el envío?',
  '¿Hacen envíos internacionales?',
  '¿Cómo puedo cambiar o devolver un producto?',
  '¿Cuáles son los medios de pago?',
  '¿Hay stock disponible de todos los productos?',
  '¿Cómo puedo contactar a soporte?',
];

describe('FaqSection', () => {
  // ── 1. Título y subtítulo ─────────────────────────────────────────────

  it('renderiza el título "Preguntas Frecuentes"', () => {
    render(<FaqSection />);
    expect(
      screen.getByRole('heading', { name: 'Preguntas Frecuentes' })
    ).toBeInTheDocument();
  });

  it('renderiza el subtítulo', () => {
    render(<FaqSection />);
    expect(
      screen.getByText('Todo lo que necesitás saber antes de comprar')
    ).toBeInTheDocument();
  });

  // ── 2. Preguntas visibles ─────────────────────────────────────────────

  it('renderiza las 6 preguntas visibles inicialmente', () => {
    render(<FaqSection />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(6);

    QUESTIONS.forEach((q) => {
      expect(screen.getByText(q)).toBeInTheDocument();
    });
  });

  // ── 3. Respuestas colapsadas inicialmente ─────────────────────────────

  it('las respuestas NO son visibles inicialmente (todas colapsadas)', () => {
    render(<FaqSection />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('los contenedores de respuesta tienen role="region"', () => {
    render(<FaqSection />);
    // The <section> implicitly gets role="region" via aria-label,
    // so we filter it out to count only the answer divs
    const allRegions = screen.getAllByRole('region');
    const answerRegions = allRegions.filter((r) => r.tagName !== 'SECTION');
    expect(answerRegions).toHaveLength(6);
    answerRegions.forEach((r) => {
      expect(r).toHaveAttribute('role', 'region');
    });
  });

  // ── 4. Acordeón: abrir una pregunta ───────────────────────────────────

  it('al hacer clic en una pregunta, se expande su respuesta', () => {
    render(<FaqSection />);
    const firstButton = screen.getAllByRole('button')[0];

    fireEvent.click(firstButton);

    expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    // El contenido de la respuesta está en el DOM (aunque hidden via CSS)
    expect(screen.getByText(/El envío estándar tarda entre 5 y 10 días hábiles/)).toBeInTheDocument();
  });

  // ── 5. Acordeón: cerrar la misma pregunta ─────────────────────────────

  it('al hacer clic en la misma pregunta de nuevo, se colapsa', () => {
    render(<FaqSection />);
    const firstButton = screen.getAllByRole('button')[0];

    // Abrir
    fireEvent.click(firstButton);
    expect(firstButton).toHaveAttribute('aria-expanded', 'true');

    // Cerrar
    fireEvent.click(firstButton);
    expect(firstButton).toHaveAttribute('aria-expanded', 'false');
  });

  // ── 6. Acordeón: modo acordeón (solo una abierta) ────────────────────

  it('al hacer clic en una pregunta diferente, se cierra la anterior y se abre la nueva (modo acordeón)', () => {
    render(<FaqSection />);
    const buttons = screen.getAllByRole('button');

    // Abrir primera pregunta
    fireEvent.click(buttons[0]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'false');

    // Abrir segunda pregunta
    fireEvent.click(buttons[1]);
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
  });

  // ── 7. Controles de accesibilidad en cada pregunta ────────────────────

  it('cada botón de pregunta tiene aria-controls que referencia su región', () => {
    render(<FaqSection />);
    const buttons = screen.getAllByRole('button');

    buttons.forEach((button, index) => {
      expect(button).toHaveAttribute('aria-controls', `faq-answer-${index}`);
    });
  });

  it('cada región de respuesta tiene un id que coincide con aria-controls', () => {
    render(<FaqSection />);
    const allRegions = screen.getAllByRole('region');
    // The first "region" is the <section>, skip it to check only answer divs
    const answerRegions = allRegions.filter((r) => r.tagName !== 'SECTION');

    answerRegions.forEach((region, index) => {
      expect(region).toHaveAttribute('id', `faq-answer-${index}`);
    });
  });

  // ── 8. La sección tiene aria-label ────────────────────────────────────

  it('la sección FAQ tiene aria-label="Preguntas frecuentes"', () => {
    render(<FaqSection />);
    const section = screen.getByLabelText('Preguntas frecuentes');
    expect(section).toBeInTheDocument();
    expect(section.tagName).toBe('SECTION');
  });
});
