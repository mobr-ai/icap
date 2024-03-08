# icap

ICAP: a platform for users to retrieve structured knowledge from various sources in the ICP

# Installing, testing, deployng

## Installing dependencies
```bash
# installing Azle and other dependencies
npm install
```

## testing
```bash
# tests all functions in this package
npm test
```


## building and deploying
```bash
#Start up your local replica:
dfx start --background
dfx canister create icap
dfx build

#Deploy your canister:
dfx deploy
```

# Interesting possible corrections to make on ic glossary:

From the Glossary available in https://internetcomputer.org/docs/current/references/glossary :

1.  Broken Link on the "Principal" word to wikipedia when defining Principal:
    stated as: https://en.wikipedia.org/wiki/Principal-(computer-security)
    should be replaced by: https://en.wikipedia.org/wiki/Principal_(computer_security)
2.  Broken Link on the "actor model" word to wikipedia when defining Actor:
    stated as: https://en.wikipedia.org/wiki/Actor-model
    should be replaced by: https://en.wikipedia.org/wiki/Actor_model
3.  Broken Link on the "messages" word when defining Batch:
    stated as: https://internetcomputer.org/docs/current/references/glossary#messages
    should be replaced by: https://internetcomputer.org/docs/current/references/glossary#message
