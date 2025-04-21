export default [
  {
    path: '/',
    component: () => import('@/views/External'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/components/home/Home'),
        meta: {
          bgFill: true
        }
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/components/home/Register'),
        meta: {
          bgFill: true
        }
      },
      {
        path: 'forgot-password',
        name: 'Forgot Password',
        component: () => import('@/components/home/ForgotPassword'),
        meta: {
          bgFill: true
        }
      },
      {
        path: 'contact-us',
        name: 'Contact Us',
        component: () => import('@/components/home/ContactUs'),
        meta: {
          bgFill: true
        }
      }
    ]
  }
]
