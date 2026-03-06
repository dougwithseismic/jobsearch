FROM apify/actor-node:22

# Copy the entire package (library + actor)
COPY --chown=myuser package.json ./
COPY --chown=myuser src/ ./src/
COPY --chown=myuser actor/ ./actor/

# Install actor dependencies
WORKDIR /home/myuser/actor
COPY --chown=myuser actor/package.json ./
RUN npm install --omit=dev

WORKDIR /home/myuser
CMD ["npx", "tsx", "actor/src/main.ts"]
