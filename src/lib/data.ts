import type { Provider } from './types';

export const providers: Provider[] = [
  {
    id: '1',
    name: 'João Silva',
    category: 'Pedreiro',
    location: 'São Paulo, SP',
    avatarUrl: 'https://placehold.co/100x100.png',
    rating: 4.8,
    reviewCount: 25,
    bio: 'Mais de 15 anos de experiência em alvenaria, construção de muros e reformas em geral. Qualidade e compromisso com o prazo são minhas prioridades.',
    skills: ['Alvenaria', 'Reboco', 'Construção de Lajes', 'Fundações'],
    availability: 'Disponível em 2 semanas',
    portfolio: [
      { id: 'p1', imageUrl: 'https://placehold.co/600x400.png', description: 'Construção de muro residencial', "data-ai-hint": "brick wall" },
      { id: 'p2', imageUrl: 'https://placehold.co/600x400.png', description: 'Reforma de fachada', "data-ai-hint": "house facade" },
      { id: 'p3', imageUrl: 'https://placehold.co/600x400.png', description: 'Piso de concreto polido', "data-ai-hint": "concrete floor" },
    ],
    reviews: [
      {
        id: 'r1',
        author: { name: 'Maria Costa', avatarUrl: 'https://placehold.co/100x100.png' },
        rating: 5,
        comment: 'Serviço impecável! O João é muito caprichoso e entregou a obra antes do prazo. Recomendo demais!',
        date: '20/05/2024',
      },
      {
        id: 'r2',
        author: { name: 'Carlos Andrade', avatarUrl: 'https://placehold.co/100x100.png' },
        rating: 4,
        comment: 'Bom profissional, trabalhou bem. Apenas um pequeno atraso na finalização, mas o resultado ficou ótimo.',
        date: '15/04/2024',
      },
    ],
  },
  {
    id: '2',
    name: 'Ana Pereira',
    category: 'Pintora',
    location: 'Rio de Janeiro, RJ',
    avatarUrl: 'https://placehold.co/100x100.png',
    rating: 5.0,
    reviewCount: 42,
    bio: 'Pintora profissional com foco em acabamentos finos e pintura decorativa. Utilizo as melhores tintas e técnicas para um resultado duradouro e bonito.',
    skills: ['Pintura Interna', 'Pintura Externa', 'Textura', 'Efeitos Decorativos'],
    availability: 'Disponível imediatamente',
    portfolio: [
        { id: 'p4', imageUrl: 'https://placehold.co/600x400.png', description: 'Pintura de sala de estar', "data-ai-hint": "living room" },
        { id: 'p5', imageUrl: 'https://placehold.co/600x400.png', description: 'Fachada de prédio comercial', "data-ai-hint": "building facade" },
    ],
    reviews: [
        {
            id: 'r3',
            author: { name: 'Fernanda Lima', avatarUrl: 'https://placehold.co/100x100.png' },
            rating: 5,
            comment: 'A Ana transformou meu apartamento! O trabalho dela é de uma qualidade incrível, e ela é super organizada e limpa. Virou minha pintora oficial!',
            date: '01/06/2024'
        },
        {
            id: 'r4',
            author: { name: 'Ricardo Mendes', avatarUrl: 'https://placehold.co/100x100.png' },
            rating: 2,
            comment: 'Não gostei do acabamento em algumas paredes. A cor ficou manchada e tive que pedir para refazer. Atrasou a entrega da minha reforma.',
            imageUrl: 'https://placehold.co/400x300.png',
            date: '10/05/2024'
        }
    ],
  },
  {
    id: '3',
    name: 'Marcos Oliveira',
    category: 'Eletricista',
    location: 'Belo Horizonte, MG',
    avatarUrl: 'https://placehold.co/100x100.png',
    rating: 4.9,
    reviewCount: 31,
    bio: 'Eletricista certificado com experiência em instalações residenciais e comerciais. Segurança e conformidade com as normas são minhas garantias.',
    skills: ['Instalação Elétrica', 'Manutenção Preventiva', 'Troca de Disjuntores', 'Iluminação'],
    availability: 'Disponível na próxima semana',
    portfolio: [
        { id: 'p6', imageUrl: 'https://placehold.co/600x400.png', description: 'Instalação de quadro de luz', "data-ai-hint": "electrical panel" },
    ],
    reviews: [
        {
            id: 'r5',
            author: { name: 'Juliana Paes', avatarUrl: 'https://placehold.co/100x100.png' },
            rating: 5,
            comment: 'Profissional excelente, resolveu um problema complexo na minha fiação de forma rápida e segura. Preço justo.',
            date: '25/05/2024'
        }
    ],
  },
  {
    id: '4',
    name: 'Carlos Souza',
    category: 'Ajudante',
    location: 'São Paulo, SP',
    avatarUrl: 'https://placehold.co/100x100.png',
    rating: 4.5,
    reviewCount: 15,
    bio: 'Ajudante de obra geral, com disposição para carga e descarga, demolição, e auxílio a pedreiros e pintores. Sou proativo e aprendo rápido.',
    skills: ['Carga e Descarga', 'Demolição', 'Limpeza de Obra', 'Preparo de Massa'],
    availability: 'Disponível imediatamente',
    portfolio: [],
    reviews: [
        {
            id: 'r6',
            author: { name: 'Construtora Alfa', avatarUrl: 'https://placehold.co/100x100.png' },
            rating: 5,
            comment: 'O Carlos é um excelente ajudante. Muito esforçado e sempre disposto a colaborar. Recomendo a contratação.',
            date: '05/06/2024'
        }
    ],
  },
];
