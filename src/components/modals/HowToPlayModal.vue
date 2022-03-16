<template>
  <div
    class="modal fade"
    id="how-to-play-modal"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">COMO JOGAR</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body text-center">
          <p>
            Convide seus amigos e dispute quem acerta a palavra de 5 letras por
            primeiro.
            <br />
            Você terá 6 tentativas. Digite a palavra e aperte ENTER ou no botão
            confirmar.
            <br />
            Após cada chute, as letras mudarão de cor para indicar seu
            progresso.
          </p>

          <hr />

          <div
            v-for="(example, exampleIndex) in examples"
            :key="exampleIndex"
            class="mb-3"
          >
            <span v-html="example.title"></span>
            <div class="d-flex justify-content-center gap-2 mt-2">
              <div
                v-for="(letter, letterIndex) in example.letters"
                :key="letterIndex"
                class="letterContainer"
                :class="{
                  [example.highlightClass]:
                    letterIndex == example.highlightedLetterIndex,
                }"
              >
                <span>{{ letter.toUpperCase() }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      examples: [
        {
          title: 'Caso a letra fique verde, ela está correta.',
          letters: ['s', 'a', 'b', 'e', 'r'],
          highlightedLetterIndex: 4,
          highlightClass: 'bg-success text-white',
        },
        {
          title:
            'Caso a letra fique amarela, ela está na palavra mas está na posição errada.',
          letters: ['e', 's', 't', 'a', 'r'],
          highlightedLetterIndex: 2,
          highlightClass: 'bg-warning text-white',
        },
        {
          title: 'Caso fique vermelha, a letra <b class="text-danger">não</b> está na palavra.',
          letters: ['n', 'o', 's', 's', 'o'],
          highlightedLetterIndex: 0,
          highlightClass: 'bg-danger text-white',
        },
      ],
    }
  },
}
</script>

<style scoped>
.letterContainer {
  padding: 1em 1.4rem;
  border: 1px solid black;
  border-radius: 8px;
}

@media (max-width: 700px) {
  .letterContainer {
    padding: 0rem 0.6em;
  }
}
</style>
