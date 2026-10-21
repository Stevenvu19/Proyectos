/* ========== ESTADO Y DATOS BASE ========== */
const KEY_DAT = 'AIDAMAR_DAT_V1';

// Carta de Platos con imágenes
const DB_CARTA = [
  {
    id: 1,
    nom: 'Trío Aidamar - Arroz',
    cat: ['ceviches', 'arroces', 'mariscos', 'chicharrones', 'tríos'],
    pre: 22.00,
    img: 'https://thumbs.dreamstime.com/b/arroz-ceviche-con-marisco-y-comida-chicharron-de-pesca-peruana-base-pescado-en-frito-yucas-conocido-como-trio-marino-placa-200135285.jpg',
    desc: 'Ceviche de pota, Chicharrón de pota, Arroz con mariscos.'
  },

  {
    id: 2,
    nom: 'Trío Aidamar - Mariscos',
    cat: ['ceviches', 'arroces', 'mariscos', 'chicharrones', 'tríos'],
    pre: 22.00,
    img: 'https://aceleralastatic.nyc3.cdn.digitaloceanspaces.com/files/uploads/2823/1590615819-26-foto-4-png.png',
    desc: 'Ceviche de pota, Chicharrón de pota, Chaufa con mariscos.'
  },

  {
    id: 3,
    nom: 'Dúo Aidamar',
    cat: ['ceviches', 'chicharrones', 'dúos'],
    pre: 20.00,
    img: 'https://i.pinimg.com/736x/73/90/1a/73901a07b066ae269aabcf623fdc7a03.jpg',
    desc: 'Ceviche de pota, Chicharrón de pota.'
  },

  {
    id: 4,
    nom: 'Fusión Aidamar Premium',
    cat: ['entradas', 'dúos', 'causas'],
    pre: 22.00,
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzAXzm4lP5d8SdDV3WDLFpeW8yKWFjVMr2cbsRH4cpZHmd54Zjo5Vo_Tw&s=10',
    desc: 'Causa, Leche de tigre con pescado.'
  },

  {
    id: 5,
    nom: 'Fusión Aidamar Clásico',
    cat: ['entradas', 'dúos', 'causas'],
    pre: 16.00,
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzAXzm4lP5d8SdDV3WDLFpeW8yKWFjVMr2cbsRH4cpZHmd54Zjo5Vo_Tw&s=10',
    desc: 'Causa, Leche de tigre con pota.'
  },

  {
    id: 6,
    nom: 'Leche de tigre',
    cat: ['entradas'],
    pre: 10.00,
    img: 'https://www.locallifesc.com/wp-content/uploads/2026/02/Ceviche-in-a-glass-ss.jpg',
    desc: 'Leche de tigre'
  },

  {
    id: 7,
    nom: 'Choritos a la chalaca',
    cat: ['entradas'],
    pre: 20.00,
    img: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Choritos_a_la_chalaca.JPG?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=original',
    desc: 'Choritos a la chalaca'
  },

  {
    id: 8,
    nom: 'Choripulpos',
    cat: ['entradas'],
    pre: 18.00,
    img: 'https://i.pinimg.com/1200x/4d/0d/51/4d0d5110444b7953486b8ade3e19322b.jpg',
    desc: 'Choripulpos'
  },

  {
    id: 9,
    nom: 'Leche de tigre',
    cat: ['entradas'],
    pre: 18.00,
    img: 'https://www.locallifesc.com/wp-content/uploads/2026/02/Ceviche-in-a-glass-ss.jpg',
    desc: 'Leche de tigre'
  },

  {
    id: 10,
    nom: 'Leche de pantera',
    cat: ['entradas'],
    pre: 20.00,
    img: 'https://i.pinimg.com/736x/0a/54/10/0a541057551ce203a28d17f283792cc7.jpg',
    desc: 'Leche de pantera'
  },

  {
    id: 11,
    nom: 'Pulpo al olivo',
    cat: ['entradas'],
    pre: 25.00,
    img: 'https://i.pinimg.com/1200x/65/ef/82/65ef82a52bd5a71b9c3d7a1caf0d0169.jpg',
    desc: 'Pulpo al olivo'
  },

  {
    id: 12,
    nom: 'Conchitas a la parmesana',
    cat: ['entradas'],
    pre: 25.00,
    img: 'https://i.pinimg.com/736x/fc/15/11/fc15118bd34751f2ba146f2dde266834.jpg',
    desc: 'Conchitas a la parmesana'
  },

  {
    id: 13,
    nom: 'Causa de langostino',
    cat: ['causas'],
    pre: 25.00,
    img: 'https://i.pinimg.com/236x/b2/d1/cd/b2d1cda3a81847ff2f3b0fc5cb1f2a98.jpg',
    desc: 'Causa de langostino'
  },

  {
    id: 14,
    nom: 'Causa acevichada',
    cat: ['causas', 'ceviches'],
    pre: 25.00,
    img: 'https://i.pinimg.com/736x/60/ca/d4/60cad43ef1bbed91e67a7b52ea91b394.jpg',
    desc: 'Causa acevichada'
  },

  {
    id: 15,
    nom: 'Causa de pulpo al olivo',
    cat: ['causas'],
    pre: 25.00,
    img: 'https://i.ytimg.com/vi/D5I3l0VqS2M/maxresdefault.jpg',
    desc: 'Causa de pulpo al olivo'
  },

  {
    id: 16,
    nom: 'Ceviche de pescado',
    cat: ['ceviches'],
    pre: 30.00,
    img: 'https://i.pinimg.com/1200x/35/ed/06/35ed064ee44ee7496d42778865bf3a71.jpg',
    desc: 'Ceviche de pescado'
  },

  {
    id: 17,
    nom: 'Ceviche mixto',
    cat: ['ceviches'],
    pre: 33.00,
    img: 'https://cdn.tasteatlas.com/images/dishes/0f0ff6300b6e41c8bfe6266497601818.jpg',
    desc: 'Ceviche mixto'
  },

  {
    id: 18,
    nom: 'Ceviche de conchas negras',
    cat: ['ceviches'],
    pre: 33.00,
    img: 'https://micevichedehoy.com/assets/images/ceviche-de-conchas-negras_800x534.webp',
    desc: 'Ceviche de conchas negras'
  },

  {
    id: 19,
    nom: 'Ceviche carretillero',
    cat: ['ceviches'],
    pre: 28.00,
    img: 'https://i.pinimg.com/736x/84/84/a2/8484a2e8ebf8b83d06f1286b471e26e4.jpg',
    desc: 'Ceviche carretillero'
  },

  {
    id: 20,
    nom: 'Ceviche clásico',
    cat: ['ceviches'],
    pre: 33.00,
    img: 'https://i.pinimg.com/736x/84/e6/42/84e642db746fdae08b402af3ebd15e3b.jpg',
    desc: 'Ceviche clásico'
  },

  {
    id: 21,
    nom: 'Arroz con mariscos',
    cat: ['arroces', 'mariscos'],
    pre: 30.00,
    img: 'https://i.pinimg.com/1200x/a0/8f/04/a08f0421f219c339ae169a5b65f69686.jpg',
    desc: 'Arroz con mariscos'
  },

  {
    id: 22,
    nom: 'Chaufa de mariscos',
    cat: ['arroces', 'mariscos'],
    pre: 30.00,
    img: 'https://i.pinimg.com/1200x/ce/fd/48/cefd48d03b1845b0d96fbf7c6dc478e6.jpg',
    desc: 'Chaufa de mariscos'
  },

  {
    id: 23,
    nom: 'Chaufa de pescado',
    cat: ['arroces'],
    pre: 30.00,
    img: 'https://i.pinimg.com/1200x/29/b3/c6/29b3c6923ea05cfd02761e906580ac22.jpg',
    desc: 'Chaufa de pescado'
  },

  {
    id: 24,
    nom: 'Chicharrón de pescado',
    cat: ['entradas', 'chicharrones'],
    pre: 30.00,
    img: 'https://i.pinimg.com/736x/3b/87/b2/3b87b2a627bf204a5f3bd7399d32bcd4.jpg',
    desc: 'Refresco chicharrón de pescado'
  },

  {
    id: 25,
    nom: 'Chicharrón mixto',
    cat: ['entradas', 'chicharrones'],
    pre: 33.00,
    img: 'https://tofuu.getjusto.com/orioneat-local/resized2/cfygADK3wN7ne5PEg-x-2400.webp',
    desc: 'Refresco chicharrón mixto'
  },

  {
    id: 26,
    nom: 'Chicharrón de pota',
    cat: ['entradas', 'chicharrones'],
    pre: 28.00,
    img: 'https://cdn0.recetasgratis.net/es/posts/7/0/3/chicharron_de_pota_75307_1200.jpg',
    desc: 'Refresco chicharrón de pota'
  },

  {
    id: 27,
    nom: 'Jalea de pescado',
    cat: ['entradas', 'chicharrones', 'mariscos'],
    pre: 28.00,
    img: 'https://jameaperu.com/assets/images/jalea-de-pescado_800x534.webp',
    desc: 'Jalea de pescado'
  },

  {
    id: 28,
    nom: 'Jalea mixta',
    cat: ['entradas', 'mariscos', 'chicharrones'],
    pre: 28.00,
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOckOcAJJtWg74nK5mQtYA1HEhRGQRjmrDSCBJUkj7oVAbaH7SI_cFV9Y&s=10',
    desc: 'Jalea mixta'
  },

  {
    id: 29,
    nom: 'Ceviche de pescado',
    cat: ['ceviches', 'chicharrones', 'dúos'],
    pre: 30.00,
    img: 'https://campograndeperu.com/wp-content/uploads/2025/01/chicharron-de-pota-lima-1.jpg',
    desc: 'Ceviche de pescado, chicharrón de pescado'
  },

  {
    id: 30,
    nom: 'Ceviche de pescado',
    cat: ['mariscos', 'ceviches', 'chicharrones', 'dúos'],
    pre: 30.00,
    img: 'https://i.pinimg.com/1200x/25/bd/dc/25bddcfe971b03d4a14938cbaf20b18d.jpg',
    desc: 'Ceviche de pescado, Arroz con mariscos'
  },

  {
    id: 31,
    nom: 'Ceviche de pescado',
    cat: ['ceviches', 'chicharrones', 'dúos'],
    pre: 30.00,
    img: 'https://donangelo.pe/wp-content/uploads/2022/12/Duo-ceviche-con-chaufa-e1691952921153.jpg',
    desc: 'Ceviche de pescado, Chaufa de pescado'
  },

  {
    id: 32,
    nom: 'Ceviche de pescado',
    cat: ['mariscos', 'ceviches', 'chicharrones', 'dúos'],
    pre: 30.00,
    img: 'https://donangelo.pe/wp-content/uploads/2022/12/Duo-ceviche-con-chaufa-e1691952921153.jpg',
    desc: 'Ceviche de pescado, Chaufa de mariscos'
  },

  {
    id: 33,
    nom: 'Trío arroz con mariscos',
    cat: ['mariscos', 'ceviches', 'chicharrones', 'tríos'],
    pre: 35.00,
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBIIOQrZ3CHwzH3Ioq9-A3764lcCPjXesyk56Zlr-kUb917eKdUhJ_Fjg&s=10',
    desc: 'Ceviche de pescado, Chicharrón de pescado, Arroz con mariscos'
  },

  {
    id: 34,
    nom: 'Trío chaufa de mariscos',
    cat: ['mariscos', 'ceviches', 'chicharrones', 'tríos'],
    pre: 35.00,
    img: 'https://tofuu.getjusto.com/orioneat-local/resized2/hND8zN7oqHjYvt6Rk-2400-x.webp',
    desc: 'Ceviche de pescado, Chicharrón de pescado, Chaufa de mariscos'
  },

  {
    id: 35,
    nom: 'Trío chaufa de pescado',
    cat: ['mariscos', 'ceviches', 'chicharrones', 'tríos'],
    pre: 35.00,
    img: 'https://tofuu.getjusto.com/orioneat-local/resized2/G8ks2rLqKPm8nvgTv-300-x.webp',
    desc: 'Ceviche de pescado, Chicharrón de pescado, Chaufa de pescado'
  },

  {
    id: 36,
    nom: 'Chicha morada 1/2 Litro',
    cat: ['bebidas'],
    pre: 8.00,
    img: 'https://media.istockphoto.com/id/2171802364/es/foto/jarra-de-chicha-morada-mazorca-de-ma%C3%ADz-morado-limones-pi%C3%B1a-y-canela.jpg?s=170667a&w=0&k=20&c=KNazSCBgHX2BkaJSppLrunq0pCGYQtdLhti35D1lez4=',
    desc: 'Refresco chicha morada'
  },

  {
    id: 37,
    nom: 'Chicha morada 1 Litro',
    cat: ['bebidas'],
    pre: 15.00,
    img: 'https://media.istockphoto.com/id/2171802364/es/foto/jarra-de-chicha-morada-mazorca-de-ma%C3%ADz-morado-limones-pi%C3%B1a-y-canela.jpg?s=170667a&w=0&k=20&c=KNazSCBgHX2BkaJSppLrunq0pCGYQtdLhti35D1lez4=',
    desc: 'Refresco chicha morada'
  },

  {
    id: 38,
    nom: 'Chicha de maracucyá 1/2 Litro',
    cat: ['bebidas'],
    pre: 8.00,
    img: 'https://i.pinimg.com/736x/6d/57/43/6d57439488c266f6e30d6e10a40800f9.jpg',
    desc: 'Refresco chicha de maracucyá'
  },

  {
    id: 39,
    nom: 'Chicha de maracucyá 1 Litro',
    cat: ['bebidas'],
    pre: 15.00,
    img: 'https://i.pinimg.com/736x/6d/57/43/6d57439488c266f6e30d6e10a40800f9.jpg',
    desc: 'Refresco chicha de maracucyá'
  },

  {
    id: 40,
    nom: 'Inca kola 1 Litro',
    cat: ['bebidas'],
    pre: 7.00,
    img: 'https://mir-s3-cdn-cf.behance.net/project_modules/1400/b7a54398064649.5ed3edb8258c1.gif',
    desc: 'Gaseosa Inca Kola'
  },

  {
    id: 41,
    nom: 'Inca kola 1.5 Litros',
    cat: ['bebidas'],
    pre: 10.00,
    img: 'https://mir-s3-cdn-cf.behance.net/project_modules/1400/b7a54398064649.5ed3edb8258c1.gif',
    desc: 'Gaseosa Inca Kola'
  },

  {
    id: 42,
    nom: 'Inca kola personal',
    cat: ['bebidas'],
    pre: 5.00,
    img: 'https://mir-s3-cdn-cf.behance.net/project_modules/1400/b7a54398064649.5ed3edb8258c1.gif',
    desc: 'Gaseosa Inca Kola'
  },

  {
    id: 43,
    nom: 'Coca Cola 1 Litro',
    cat: ['bebidas'],
    pre: 7.00,
    img: 'https://cdn.dribbble.com/userupload/34378341/file/original-e9e9ae1ec33ec8eee369b1c353b5d4dc.gif',
    desc: 'Gaseosa Coca Cola'
  },

  {
    id: 44,
    nom: 'Coca Cola 1.5 Litros',
    cat: ['bebidas'],
    pre: 10.00,
    img: 'https://cdn.dribbble.com/userupload/34378341/file/original-e9e9ae1ec33ec8eee369b1c353b5d4dc.gif',
    desc: 'Gaseosa Coca Cola'
  },

  {
    id: 45,
    nom: 'Coca cola personal',
    cat: ['bebidas'],
    pre: 5.00,
    img: 'https://cdn.dribbble.com/userupload/34378341/file/original-e9e9ae1ec33ec8eee369b1c353b5d4dc.gif',
    desc: 'Gaseosa Coca cola'
  },

  {
    id: 46,
    nom: 'Pilsen',
    cat: ['bebidas'],
    pre: 9.00,
    img: 'https://images.seeklogo.com/logo-png/34/1/pilsen-callao-logo-png_seeklogo-344258.png',
    desc: 'Cerveza Pilsen'
  },

  {
    id: 47,
    nom: 'Cusqueña Trigo',
    cat: ['bebidas'],
    pre: 10.00,
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRslm0OE5YbTZRJn7_YccoKkLpTVG8hH1Yg4sPyUx2kvg&s=10',
    desc: 'Cerveza Cusqueña Trigo'
  },

  {
    id: 48,
    nom: 'Agua Mineral',
    cat: ['bebidas'],
    pre: 3.00,
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTKdOWkY3qyRTbxKkLeZMCmfgyo5vjC7GAEf_H_vR-ZT042Z5Xa-RMIfc&s=10',
    desc: 'Agua Cielo'
  },

  {
    id: 49,
    nom: 'Parihuela de filete',
    cat: ['parihuelas', 'mariscos'],
    pre: 30.00,
    img: 'https://tofuu.getjusto.com/orioneat-local/resized2/vSZLvGQLHB2y3pTK8-2400-x.webp',
    desc: 'Parihuela de filete'
  },

  {
    id: 50,
    nom: 'Parihuela pesca del día',
    cat: ['parihuelas', 'mariscos'],
    pre: 33.00,
    img: 'https://scontent-lim1-1.xx.fbcdn.net/v/t39.30808-6/600318631_1278410090989891_1723753748637406037_n.jpg?stp=dst-jpg_tt6&cstp=mx1200x1500&ctp=s640x640&_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_ohc=FuUowQ1TJD4Q7kNvwH87D9l&_nc_oc=AdreKu2lGUVFPgs_pX-AkMqrE5FgLOIBk_n3pOXqAdPj6GlXEaKu27rxHX2xSlgXBDw&_nc_zt=23&_nc_ht=scontent-lim1-1.xx&_nc_gid=xrRh5g6-Zv7hO1nc-FFG3A&_nc_ss=7b2a8&oh=00_AQO9G7OkRa6CdeiSXJ9XK6MYCJLPGQGuzuZneJxLwWFb9Q&oe=6AD9C367',
    desc: 'Parihuela pesca del día'
  },
  
  {
    id: 51,
    nom: 'Sudado de filete',
    cat: ['sudados', 'mariscos'],
    pre: 30.00,
    img: 'https://scontent-lim1-1.xx.fbcdn.net/v/t39.30808-6/600318631_1278410090989891_1723753748637406037_n.jpg?stp=dst-jpg_tt6&cstp=mx1200x1500&ctp=s640x640&_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_ohc=FuUowQ1TJD4Q7kNvwH87D9l&_nc_oc=AdreKu2lGUVFPgs_pX-AkMqrE5FgLOIBk_n3pOXqAdPj6GlXEaKu27rxHX2xSlgXBDw&_nc_zt=23&_nc_ht=scontent-lim1-1.xx&_nc_gid=xrRh5g6-Zv7hO1nc-FFG3A&_nc_ss=7b2a8&oh=00_AQO9G7OkRa6CdeiSXJ9XK6MYCJLPGQGuzuZneJxLwWFb9Q&oe=6AD9C367',
    desc: 'Sudado de filete'
  },
  
  {
    id: 52,
    nom: 'Sudado pesca del día',
    cat: ['sudados', 'mariscos'],
    pre: 33.00,
    img: 'https://i.pinimg.com/1200x/c3/bf/a5/c3bfa594abe9519b8ab46d127f57de6c.jpg',
    desc: 'Sudado pesca del día'
  },
  
  {
    id: 53,
    nom: 'Chupe de pescado',
    cat: ['chupes', 'mariscos'],
    pre: 30.00,
    img: 'https://i.pinimg.com/1200x/89/2c/dc/892cdccb4f28c73bf6738b7a3e81ddc0.jpg',
    desc: 'Chupe de pescado'
  },
  
  {
    id: 54,
    nom: 'Chupe de langostino',
    cat: ['chupes', 'mariscos'],
    pre: 33.00,
    img: 'https://i.pinimg.com/1200x/99/b0/17/99b0172044fd850763b903216d96d69e.jpg',
    desc: 'Chupe de langostino'
  },
  
  {
    id: 55,
    nom: 'Tacu tacu en salsa de mariscos',
    cat: ['tacu tacu', 'mariscos'],
    pre: 30.00,
    img: 'https://i.pinimg.com/1200x/25/b1/1a/25b11abe83f1558c0f034ea6e1b93aa7.jpg',
    desc: 'Tacu tacu en salsa de mariscos'
  },
  
  {
    id: 56,
    nom: 'Tacu tacu en lomo saltado',
    cat: ['tacu tacu', 'arroces', 'mariscos'],
    pre: 30.00,
    img: 'https://i.pinimg.com/1200x/94/88/c2/9488c26bbbbf00be286040c0f7c7bc67.jpg',
    desc: 'Tacu tacu en lomo saltado'
  },
  
  {
    id: 57,
    nom: 'Filete a lo macho',
    cat: ['tacu tacu', 'arroces', 'mariscos'],
    pre: 30.00,
    img: 'https://i.pinimg.com/1200x/a6/da/fc/a6dafcbf2ea6ac283693f814517906b4.jpg',
    desc: 'Filete a lo macho'
  },
  
  {
    id: 58,
    nom: 'Ronda caliente',
    cat: ['rondas', 'arroces', 'chicharrones', 'ceviches'],
    pre: 55.00,
    img: 'https://scontent-lim1-1.xx.fbcdn.net/v/t39.30808-6/472190731_963140649209765_8175959699269706926_n.jpg?stp=dst-jpg_tt6&cstp=mx1435x1321&ctp=s1435x1321&_nc_cat=103&ccb=1-7&_nc_sid=127cfc&_nc_ohc=kk0OS-5sNOIQ7kNvwHaVidg&_nc_oc=AdqaXTaonobnXS8ySi1i4oaukOulWj7ZM6i2MVsx2677x4kyjvnhiS4yxgDqc62m41g&_nc_zt=23&_nc_ht=scontent-lim1-1.xx&_nc_gid=-Z24Ai-X0Q-3E3tgBfh2eQ&_nc_ss=7b2a8&oh=00_AQOF5INTijllLeQEgfz48dKbAVeb7lQ6KlvlcY29HUFGZg&oe=6AD9D665',
    desc: 'Arroz con mariscos, Chaufa de mariscos, Chicharron de pescado, Ceviche de pescado, Leche de tigre'
  },
  
  {
    id: 59,
    nom: 'Ronda fría',
    cat: ['rondas', 'causas', 'chicharrones', 'ceviches'],
    pre: 55.00,
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQB1ZMK8RQITlVY1Afhw4nCd-r7QWXg-TZ2zQD3WMl5JXZa7pbClPEykhHT&s=10',
    desc: 'Ceviche de pescado, Ceviche de conchas negras, Tiradito, Causa, Leche de tigre'
  },
  
  {
    id: 60,
    nom: 'Lomo Saltado',
    cat: ['criollos', 'arroces'],
    pre: 28.00,
    img: 'https://i.ytimg.com/vi/WUVlhW7dgKo/maxresdefault.jpg',
    desc: 'Lomo saltado'
  },
  
  {
    id: 61,
    nom: 'Pollo Saltado',
    cat: ['criollos', 'arroces'],
    pre: 28.00,
    img: 'https://images.falabella.com/v3/assets/blt422ac29cebae1d64/bltec49f2ea78d033ad/69efe28c74bc0f286f6c7f12/saltado_de_pollo.png',
    desc: 'Pollo saltado'
  },
  
  {
    id: 62,
    nom: 'Pollo a la plancha',
    cat: ['criollos', 'arroces'],
    pre: 28.00,
    img: 'https://berypez.pe/wp-content/uploads/2024/05/p08-pollo-a-la-plancha.webp',
    desc: 'Pollo a la plancha'
  },
  
  {
    id: 63,
    nom: 'Chicharrón de pollo',
    cat: ['criollos'],
    pre: 30.00,
    img: 'https://www.laylita.com/recetas/wp-content/uploads/2024/08/Como-hacer-chicharrones-de-pollo-crujientes.jpg',
    desc: 'Chicharrón de pollo'
  },
  
  {
    id: 64,
    nom: 'Dúo (Lomo + Chaufa)',
    cat: ['criollos', 'arroces', 'dúos'],
    pre: 28.00,
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMXMde_66AxaVHTZYUfBfuW_guPJJ1h2RlqhQ7QkKs7A&s',
    desc: 'Dúo (Lomo + Chaufa)'
  },
  
  {
    id: 65,
    nom: 'Fettuccine a la huancaína con lomo saltado',
    cat: ['criollos', 'arroces'],
    pre: 30.00,
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnl1_K5GPrBAXp4iUQPte7OcYjO2TqCFC59M2YuzYqp16zyAfl9niPzHU&s=10',
    desc: 'Fettuccine a la huancaína con lomo saltado'
  },
  
  {
    id: 66,
    nom: 'Nuggets',
    cat: ['kids'],
    pre: 20.00,
    img: 'https://imag.bonviveur.com/los-nuggets-de-pollo.jpg',
    desc: 'Nuggets'
  },
  
  {
    id: 67,
    nom: 'Salchipapas',
    cat: ['kids'],
    pre: 20.00,
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsefnbRuUkbTKMBbtdoyiTAj4ZmWcL0rG4r9bg9x2Gm2zi-zy08gmkHTla&s=10',
    desc: 'Salchipapas'
  },
  
  {
    id: 68,
    nom: 'Porción de arroz',
    cat: ['guarniciones', 'arroces'],
    pre: 5.00,
    img: 'https://thumbs.dreamstime.com/b/porci%C3%B3n-de-arroz-en-la-placa-65354553.jpg',
    desc: 'Porción de arroz'
  },
  
  {
    id: 69,
    nom: 'Porción de yuca',
    cat: ['guarniciones'],
    pre: 5.00,
    img: 'https://tofuu.getjusto.com/orioneat-local/resized2/vfyzn2D2cZD8ppQJy-2400-x.webp',
    desc: 'Porción de yuca'
  },
  
  {
    id: 70,
    nom: 'Porción de camote',
    cat: ['guarniciones'],
    pre: 5.00,
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQr-IluKkOLnE41RnhdAjub3dKtMoJFghFvIPs5OjBa6IM6o3QsjdOkTbU5&s=10',
    desc: 'Porción de camote'
  },
  
  {
    id: 71,
    nom: 'Porción de cancha',
    cat: ['guarniciones'],
    pre: 5.00,
    img: 'https://abrechtblog.wordpress.com/wp-content/uploads/2017/03/cancha_serrana-e1490593227753-1.jpg?w=640',
    desc: 'Porción de cancha'
  }
];