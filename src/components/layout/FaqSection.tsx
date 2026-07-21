import { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

const faqData: FaqItem[] = [
  {
    question: '¿Cuánto tarda el envío?',
    answer:
      'El envío estándar tarda entre 5 y 10 días hábiles. También ofrecemos envío express (24-48 hs) con un costo adicional. Una vez despachado, recibirás un código de seguimiento por email.',
  },
  {
    question: '¿Hacen envíos internacionales?',
    answer:
      'Sí, hacemos envíos a toda Latinoamérica y Estados Unidos. Los tiempos y costos varían según el destino. Contactanos para recibir un presupuesto personalizado.',
  },
  {
    question: '¿Cómo puedo cambiar o devolver un producto?',
    answer:
      'Tenés 30 días desde la recepción para cambiar o devolver cualquier producto en perfecto estado. Debe estar sin uso y con su etiqueta original. Iniciá el trámite desde tu cuenta o contactando a soporte.',
  },
  {
    question: '¿Cuáles son los medios de pago?',
    answer:
      'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, Amex), transferencia bancaria, Mercado Pago y efectivo (solo retiro en local).',
  },
  {
    question: '¿Hay stock disponible de todos los productos?',
    answer:
      'El stock se actualiza en tiempo real en cada producto. Si ves que está disponible, está en stock. Caso contrario, aparece como "Agotado".',
  },
  {
    question: '¿Cómo puedo contactar a soporte?',
    answer:
      'Podés escribirnos a info@rockmerch.com.ar, llamarnos al +54 11 5555-0123 o usar nuestro formulario de contacto. Respondemos en menos de 24 hs hábiles.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8" aria-label="Preguntas frecuentes">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Preguntas Frecuentes
        </h2>
        <p className="text-center text-gray-500 mb-10 text-sm">
          Todo lo que necesitás saber antes de comprar
        </p>

        <div className="divide-y divide-gray-200 border-t border-gray-200">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={index}>
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between gap-4 py-5 px-2 text-left text-gray-900 font-medium hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-coral focus:ring-inset rounded-sm"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span>{item.question}</span>
                  <i
                    className={`bx bx-chevron-down text-xl text-gray-500 transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="px-2 pb-5 text-gray-600 text-sm leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
