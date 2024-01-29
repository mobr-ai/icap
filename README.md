# icap

ICAP: a platform for users to retrieve structured knowledge from various sources in the ICP

# how to run

We should install Azle and all of its dependencies:
npm install

Start up your local replica:
dfx start --background
dfx canister create icap
dfx build

Deploy your canister:
dfx deploy icap

# Issues found:

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
