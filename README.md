# 🤖 rogue.ai

[Game Show Music]

Oh, my stars and galaxies! Ladies, gentlemen, and cosmic beings of all dimensions, welcome to the most exhilarating,
interdimensional explosion of entertainment ever witnessed: "Mechs of Mayhem: Multiverse Showdown!" I'm your
effervescent and ever-enthusiastic host, Orion Starstrider, and I cannot WAIT to take you on a thrill ride through
the wildest reaches of the multiverse! Picture this, my fellow excitement aficionados: a daring and dauntless robot,
plucked from the infinite possibilities of existence, and thrown headfirst into a high-octane, gladiator-style gauntlet
against the most ferocious foes from every corner of space and time! Can you feel the excitement? I know I can!
Each heart-stopping round, our gallant MechChampion will be zapped through wormholes to an entirely new dimension,
where they'll face off against jaw-dropping adversaries and navigate mind-boggling challenges! And oh, the
landscapes! We're talking neon jungles, floating battle arenas, and even the edge of a black hole! It's pure,
unadulterated, interdimensional chaos, and I am just BURSTING with anticipation! Will our dauntless MechChampion rise
above the maelstrom of multiversal madness and emerge victorious? Or will they succumb to the relentless whirlwind of
foes and face the cold, dark abyss of defeat? The suspense is positively ELECTRIC! So, my dear thrill-seekers, prepare
to be dazzled, amazed, and absolutely hooked as we embark on the most spellbinding, heart-racing, edge-of-your-seat
adventure the cosmos has ever known! Welcome to "Mechs of Mayhem: Multiverse Showdown!" Let the interdimensional battle
royale BEGIN!

[Recording done by Orion](https://drive.google.com/file/d/1fsEqVKvWyeS43T_5dTLFnGNpL_4QtUIV/view?usp=share_link)

------------

Hello there 🙂,

This was an introduction from our _not-so-kind_ host. Don't worry about him, I will tell you later.

This is the project that our team "Црън пръч црън трън гризеше. Тич, црън пръч, не гризи црън трън." developed during
the Hack AUBG, 2023.

rogue.ai is a rogue like game where you play as a robot gone rogue in a gladiator survival multidimensional TV show
where each run is a _uniquely generated_ experience. The current tech stack includes Typescript,
[GPT](https://platform.openai.com/docs/models/gpt-3-5), [Stable Diffusion](https://github.com/Stability-AI/stablediffusion),
[Elevenlabs](https://beta.elevenlabs.io/). The maps are procedurally generated using wave function collapse. The sprites
for the map are also different every run - we use stable diffusion every time a new game starts based on the user prompt.
Also, there is the naaarrator - the host of the TV show, who looks closely, comments on your actions and remembers
everything you have done throughout the game.

**Get ready for a multidimensional rumble!**

-----

**How the overall game looks like**

<img src="https://drive.google.com/uc?export=view&id=17SV8MtD95b1tyaBPNbXv3S6Q2CaM4VhE" alt="Gameplay1" width="600" height="400">

<img src="https://drive.google.com/uc?export=view&id=1POsvo1C7mVo_BwEclIuxOTwKS3LeUlft" alt="Gameplay2" width="600" height="400">

<img src="https://drive.google.com/uc?export=view&id=1OI527lNca1IkPLEQaqG6z_VTw6w8Ikk7" alt="Gameplay3" width="600" height="400">

<img src="https://drive.google.com/uc?export=view&id=1ko0NXJan_CSFZTTwSKDHGhWC2qoAvK5Q" alt="Gameplay3" width="600" height="400">

_Some sprites and tiles that we played with:_

<img src="https://drive.google.com/uc?export=view&id=1iVHiJj_jtykRqBmtJ-f7672-5HO0Ad3u" alt="Gameplay3" width="600" height="400">
<img src="https://drive.google.com/uc?export=view&id=1xYqS0-7ElGcIn2ATdvA7PSzeN6K2z9fU" alt="Gameplay3" width="600" height="400">
<img src="https://drive.google.com/uc?export=view&id=1uSmhKUTbMnw07rZnz_I2GsYJpMdV6-Rb" alt="Gameplay3" width="600" height="400">
<img src="https://drive.google.com/uc?export=view&id=1AtC7Y6c9mnRHDPj_fkdhu1OWs5CbbayA" alt="Gameplay3" width="600" height="400">
<img src="https://drive.google.com/uc?export=view&id=1RJx2raTtADfZshlqKlDzy66ycAInkcvH" alt="Gameplay3" width="600" height="400">
<img src="https://drive.google.com/uc?export=view&id=11dzu2G5rrDEE3WmH3O3DNINOOSA96MsV" alt="Gameplay3" width="600" height="400">
<img src="https://drive.google.com/uc?export=view&id=1F6usJzLG1SBanS6EEhZ7OO-M0-cDvEH-" alt="Gameplay3" width="600" height="400">
<img src="https://drive.google.com/uc?export=view&id=1dx_hc8_cnhvVYii3m2j9W0ZKOntT4zcZ" alt="Gameplay3" width="600" height="400">
<img src="https://drive.google.com/uc?export=view&id=1ulCy1L1B9UComkJ2ufgIpdVhOcFKUNZU" alt="Gameplay3" width="600" height="400">
<img src="https://drive.google.com/uc?export=view&id=14WmeFjQd93Bh7mEQrwo2S7I4ZE40mTOA" alt="Gameplay3" width="600" height="150">



**Some narration responses:**

*The player performs poorly*
    - "HAHALKJDF! That was pretty bad."
    - "Wow! You got hit twice. That's pretty bad!"
    - "You really must like bullets, ha?"
    - "You really can't dodge bullets, can you?",
    - "Looks like you're the bullet magnet today.",
    - "Getting hit again and again, are you trying to set a record or something?"
    - "Dodging is not your thing, huh? You're like a sitting duck out there."

*The player finds a chest*
    - "Congratulations, you found a bonus chest. Don't get too excited, it's probably just junk."
    - "You got a bonus chest! It's probably full of useless items though."
    - "You're lucky to have found that bonus chest. Too bad it's probably not worth much."

*The enemies dodge the player's attack*
    - "Nice try, but you missed! Looks like your aim is worse than your reflexes."
    - "You need to aim better than that. Your attacks are just too slow."

_Some lies that we told ourselves_
    - Milestone at 18:00 is going to be done no later than 19! 😁

-----

# Flow

In the beginning the user enters a prompt which, after getting expanded with some more visual descriptions, is used as
an input to Stable diffusion, which generates the sprites and tiles that we use for the visuals of the game. After that,
using wave function collapse a whole map is produced, which after scaling looks great in the game!

The gameplay is mostly comprised of what is called [bullet hell game](https://en.wikipedia.org/wiki/Bullet_hell). The
player has some health, which controls whether he levels up and whether he dies. There are many enemies which follow and
try to surround and kill the player (using A\*). There are also chests, (placed at random, with unique sprite, etc - you
already know that :smile:), which increase the HP of the player. Other stats that are collected include (TODO:) ...

During the game actions of the player are recorded and on occasion expanded using GPT to produce a snarky taunting
comment, which is then used as an input to ElevenLabs in order to produce an `mp3` audio of the phrase told by the
custom voice that we setup - the voice of [Cave Johnson](https://www.youtube.com/watch?v=IPG3eDTy-yo).

At the end, there is a really nice "End of game" screen.

-----

# Future ideas

- Produce sound, based on the current actions that are taking place. *NB:* We already did that, however we were not
completely satisfied with the result as it was way too simple, so we decided to temporarily remove it and upgrade the
process later.

-----

# Also

[*Live demo done at the hackathon*](https://drive.google.com/file/d/1fsEqVKvWyeS43T_5dTLFnGNpL_4QtUIV/view?usp=share_link)

[*Slides used for the presentation*](https://drive.google.com/file/d/1rQgvvqwe3TGMgBSAem0vzpxYCb9y6W8u/view?usp=share_link)

-----

# Outtakes

**Reality show introduction by the narrator**

[*Audio introduction #1*](https://drive.google.com/file/d/1gJjRV0QE1fAQ7GGn9-Gi2GwsQEQUHIj6/view?usp=share_link)

[*Audio introduction #2*](https://drive.google.com/file/d/1GPGVjXNwwuVHQGwwav-I7768Sv-OUpI3/view?usp=share_link)

[*Audio introduction #3*](https://drive.google.com/file/d/121uNVC-ovmeAEGJIedITMJs9StE1jkDQ/view?usp=share_link)

**Narrators**

<img src="https://drive.google.com/uc?export=view&id=1SnzXhYUbkPqixkqYpesiE4s4j0wrGzrm" alt="Narrator1" width="300" height="300"> 

<img src="https://drive.google.com/uc?export=view&id=1tCfw-EEM2ydx3A-0Ydt1FsQ8AHHhNBHN" alt="Narrator2" width="300" height="300"> 

<img src="https://drive.google.com/uc?export=view&id=1Jmvfz2AZY2xBzKIOW6Rxa7DZ-r34wnka" alt="Narrator3" width="300" height="300"> 
