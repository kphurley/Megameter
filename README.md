# Megameter
A clone of the Mille Bornes card game using Node.js, Express.js, Socket.io and Angular.js.  

# Acknowledgements
This is a pet project of mine to recreate one of my favorite childhood card games and also learn more about node and angular.
I've also wanted to create a multiplayer game for a long time and I found socket.io to be really fun to work with.  

I learned a ton from reading the following, and some of my code comes directly from these articles:

- Building real-time chess with socket.io - David Washington - http://dwcares.com/2015/10/21/realchess/
- Drag and drop in angular - Nodir Yuldashev - http://coderdiaries.com/2014/03/09/drag-and-drop-with-angularjs/
- Creating a Simple Modal System in Angular - Ben Nadel - http://www.bennadel.com/blog/2806-creating-a-simple-modal-system-in-angularjs.htm

These articles were highly informative and I want to thank both of these authors for their time in sharing their knowledge with the dev community!

# License
<a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/">
<img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc/4.0/88x31.png" />
</a><br />
<span xmlns:dct="http://purl.org/dc/terms/" property="dct:title">Megameter</span> by 
<a xmlns:cc="http://creativecommons.org/ns#" href="github.com/kphurley" property="cc:attributionName" rel="cc:attributionURL">Kevin Hurley</a> is licensed under a 
<a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/">Creative Commons Attribution-NonCommercial 4.0 International License</a>.<br />Based on a work at <a xmlns:dct="http://purl.org/dc/terms/" href="github.com/kphurley/Megameter" rel="dct:source">github.com/kphurley/Megameter</a>.

# Version History
0.01 - Most UI elements and logic working, but still not in a playable state yet.  
0.02 - Almost all of the logic for playing a hand is done - except for coup-forres.  Score counters and turn highlighters added, but still no handler for when the game ends, which means it's still not quite playable yet.
0.03 - You can play a single hand now!  Woo-hoo!  For these early stages, the hands will be up to 700.  No extension or coup-forres yet.  

# Major features still missing

- Coup-forres aren’t implemented at all (they will be soon!)

- No extension play yet (hand ends at 700)

- In a 2-player game, it’s very possible you will run out of cards.  This isn’t being handled currently - should check the deck for cards and once cards are gone from the deck game should end when all cards are played/discarded

- The deck is balanced for four players.  Might need to remove some attack cards from the deck until four players is implemented.

- The area that you have to drag a card to is tiny (often times you have to drag the card to a tiny strip of a container to play it) - working on improving the interface so that it's clear where to drag cards

# How to Play

Wikibooks article - https://en.wikibooks.org/wiki/Card_Games/Mille_Bornes

