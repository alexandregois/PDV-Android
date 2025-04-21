export default [
  {
    path: '/main',
    redirect: { name: 'Buy Parking Time' },
    component: () => import('@/views/Main'),
    children: [
      {
        path: 'parking',
        component: () => import('@/views/Page'),
        children: [
          {
            path: '',
            name: 'Buy Parking Time',
            component: () => import('@/components/parking/BuyParkingTime'),
            meta: {
              title: 'emissão de Ticket Avulso',
              image: 'parking-sign.png'
            }
          }
        ]
      },
      {
        path: 'irregularities',
        component: () => import('@/views/Page'),
        children: [
          {
            path: ':id',
            name: 'Irregularity',
            component: () => import('@/components/irregularities/PayIrregularity'),
            meta: {
              title: 'Irregularidades',
              icon: 'lnr lnr-pencil'
            }
          }
        ]
      },
      {
        path: 'payment',
        component: () => import('@/views/Page'),
        children: [
          {
            path: ':id',
            name: 'Payment OK',
            component: () => import('@/components/commons/PaymentOk'),
            meta: {
              title: 'Pagamento Confirmado',
              image: 'parking-sign.png'
            }
          }
        ]
      }
    ],
    meta: {
      auth: true
    }
  }
]
