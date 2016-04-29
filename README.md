# Megameter
A clone of the Mille Bornes card game using Node.js, Express.js, Socket.io and Angular.js.  

# Acknowledgements
This is a pet project of mine to recreate one of my favorite childhood card games and also learn more about node and angular.
I've also wanted to create a multiplayer game for a long time and I found socket.io to be really fun to work with.  

I learned a ton from reading the following, and some of my code comes directly from these articles:

- Building real-time chess with socket.io - David Washington - http://dwcares.com/2015/10/21/realchess/
- Drag and drop in angular - Nodir Yuldashev - http://coderdiaries.com/2014/03/09/drag-and-drop-with-angularjs/

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

# Major features still missing

 - Issues with safeties: They should take off the current hazard when played, if the hazard type matches the safety (they don’t currently),
they should allow another turn (they don’t currently), coup-forres aren’t implemented at all

- Score is never calculated/the game doesn’t end

- The game doesn’t reshuffle and re-deal once a hand ends

- In a 2-player game, it’s very possible you will run out of cards.  This isn’t being handled currently - should check the deck for cards and once cards are gone from the deck game should end when all cards are played/discarded

- The deck is balanced for four players.  Might need to remove some attack cards from the deck until four players is implemented.

- Game UI issues: Dropping cards onto status piles doesn’t work - might make the container divs slightly larger as a workaround for now, there’s no clear indicator that it’s your turn, score/mileage counter is not implemented

# How to Play

Wikibooks article - https://en.wikibooks.org/wiki/Card_Games/Mille_Bornes

