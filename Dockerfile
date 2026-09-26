FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY index.html style.css game.js /srv/
