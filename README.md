# Classical WarShips game.
***implemented with typescript, NODE.js, Express.js and MongoDb.***

***Rules of the game:***

Drag your ships to the desired location on your board (on the right).
To flip a ship click on it. Then click a square on the left board to start the game!

![](warshipGameDemo.gif)

All enemy ships are invisible.  When you hit an enemy ship, its damaged part appears as the red cell. When a ship is sunk, it 
becomes visible. You should sink all enemy ships. You have one shot for each move.
If you miss, the cell becomes green.

***the settings Menu is available***

***Items are:***
* registration
* login
* logout
* show statistics
* restart game
* delete your registration

![](warshipgamesettings.gif)

***Registration Menu***

(if registration is successful the notification will be sent to your email.
* Your password must be not less then seven symbols. Your password must contain at least one number.
* Your password must contain at least one special character -for example: $, #, @, !,%,^,&,*,(,)
* Your password must contain at least one upper case Latin or Russian letter and at least one low case Latin or Russian letter.
* Your password must not contain spaces

You can delete your registration.

![](warshipgameRegistration.gif)

***Login Menu.***

When your login is successful the notification will be sent to your mail.
if you do not remember your password you can activate "do not remember my password" option and the link to change your password will be sent to your registration email.

***Statistics are available only if you are logged in.***

There are three options in the statistics menu:
* chart of defeats and victories
* table of finished games (If you press the replay button the game will be replayed in replay mode. To exit replay mode click on the left board.)
* menu to delete statistics of the user.

![](warshipgameStatistics.gif)

if the game was not finished, you will be offered to restore it next time.

***Controls:***

Desktop
* To move the ship press the left button of the mouse over the ship and drag.
* To flip the ship, left-click it.
* left-click on a cell of the enemy board to make a shot.
An empty cell on click turns the color green. It means that you overshot.

Mobile
*To move the ship, long-press the ship and drag.
*To flip the ship, tap it.
*tap the enemy board to make a shot.

Connections parameters for MongoDB are set for locally installed MongoDB.

***To start the game:***
```
npm run startServer

```

***To build the project in development mode:***
```
npm run build
npm run buildServer
```

***To build the project in production mode:***
```
npm run buildProd
npm run buildServer
```

***This is what it look like***\
[Link to the game](https://warshipgame100.herokuapp.com/)
