import Phaser from 'phaser'

export default class Game extends Phaser.Scene{

    player
    stars
    bombs
    platforms
    cursors
    score = 0
    gameOver = false
    scoreText

    constructor()
    {
        super('game')
    }

    init()
    {
        // Eventos de entrada
        this.cursors = this.input.keyboard.createCursorKeys()
    }

    create()
    {
        // Fondo simple para el juego.
        this.add.image(400, 300, 'sky')

        // El grupo de plataformas contiene el suelo y las repisas sobre las que podemos saltar.
        this.platforms = this.physics.add.staticGroup()

        // Aquí se crea el suelo.
        // Escalar para ajustar al ancho del juego (el sprite original tiene un tamaño de 400x32).
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody()

        // Creando repisas
        this.platforms.create(600, 400, 'ground')
        this.platforms.create(50, 250, 'ground')
        this.platforms.create(750, 220, 'ground')

        // El jugador y sus configuraciones.
        this.player = this.physics.add.sprite(100, 450, 'dude')

        // Propiedades físicas del jugador. Se le da un ligero rebote. 
        this.player.setBounce(0.2)
        this.player.setCollideWorldBounds(true)

        // Algunas estrellas para recolectar, 12 en total, espaciadas uniformemente a 70 píxeles a lo largo del eje x.
        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        })

        this.stars.children.iterate(function (child) {
            // Dale a cada estrella un rebote ligeramente diferente.
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
        })

        this.bombs = this.physics.add.group()

        // La puntuación.
        this.scoreText = this.add.text(16, 16, 'Puntos: 0', { 
            fontSize: '32px', 
            fill: '#000' 
        })

        // Colisiones del jugador y las estrellas con las plataformas. 
        this.physics.add.collider(this.player, this.platforms)
        this.physics.add.collider(this.stars, this.platforms)
        this.physics.add.collider(this.bombs, this.platforms)

        // Comprueba si el jugador se superpone con alguna de las estrellas, si lo hace llama a la función collectStar.
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this)

        // Comprueba si el jugador se colisiona con alguna de las bombas, si lo hace llama a la función hitBomb. 
        this.physics.add.collider(this.player, this.bombs, this.hitBomb, null, this)
    }

    update()
    {
        if (this.gameOver)
        {
            return
        }
    
        if (this.cursors.left.isDown)
        {
            this.player.setVelocityX(-160)
            this.player.anims.play('left', true)
        }
        else if (this.cursors.right.isDown)
        {
            this.player.setVelocityX(160)
            this.player.anims.play('right', true)
        }
        else
        {
            this.player.setVelocityX(0)
            this.player.anims.play('turn')
        }
    
        if (this.cursors.up.isDown && this.player.body.touching.down)
        {
            this.player.setVelocityY(-330)
        }
    }

    collectStar(player, star)
    {
        star.disableBody(true, true)

        // Agregar y actualizar la puntuación.
        this.score += 10
        this.scoreText.setText('Puntos: ' + this.score)
    
        if (this.stars.countActive(true) === 0)
        {
            // Un nuevo lote de estrellas para coleccionar.
            this.stars.children.iterate(function (child) {
    
                child.enableBody(true, child.x, 0, true, true)
    
            })
    
            const x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400)
    
            const bomb = this.bombs.create(x, 16, 'bomb')

            bomb.setBounce(1)
            bomb.setCollideWorldBounds(true)
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
            bomb.allowGravity = false
        }
    }

    hitBomb(player)
    {
        this.physics.pause()
        player.setTint(0xff0000)
        player.anims.play('turn')
        this.gameOver = true
    }
}