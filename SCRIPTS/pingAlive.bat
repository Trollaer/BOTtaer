set host_name=<put your hostname here>
title Alive ping for %host_name%
:alive
curl http://bottaer.herokuapp.com/imStillAlive/%host_name%
timeout /t 900 /nobreak
cls
goto alive