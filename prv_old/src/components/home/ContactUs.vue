<template lang="pug">
  .container
    .card.rounded.semi-transparent
      .card-body
        .row
          .col-12
            h4 Fale Conosco
            p Você pode utilizar nossos canais de atendimento abaixo para entrar em contato conosco:
        .row
          .col-12.d-flex.flex-column.justify-content-between
            div.d-inline-flex.justify-content-center.my-2
              div.mr-1
                i.fas.fa-envelope
              div contato@paratyrotativo.com.br
            div.d-inline-flex.justify-content-center.my-2
              div.mr-1.rotate180
                i.fas.fa-phone
              div (24) 99821-2689
            div.d-inline-flex.justify-content-center.my-2
              div.text-center Rua Presidente Pedreira 788, quadra 008, Chácara Paraty RJ - Cep: 23.970-000
            div.d-inline-flex.justify-content-center.my-2
              div CNPJ: 00.147.923/0007-66
    .row.my-4
      .col-12.text-center
        button.btn.btn-rounded.border-0.text-blue.semi-transparent(
          type="button"
          @click="redirectTo('Home')"
        )
          i.fas.fa-arrow-left
          |  Voltar
</template>

<script>
import commons from '@/utils/mixins/commons'

export default {
  name: 'ContactUS',
  mixins: [commons]
}
</script>
