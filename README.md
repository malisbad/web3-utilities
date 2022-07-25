# web3-utilities

Utilities for Web3 JS

## Purpose

The main focus for this small suite of utiltiies is to improve the experince and utility
from the web3.js library specifically for miners who might need to do less common things
such as calculating average block rewards, or discovering whether or not their blocks have
been uncled.

## Warnings

This library doesn't play super well with light nodes and can get you boosted from the network
if you target a light node with it and run the tests constantly, or if you want to grab a range
of blocks too quickly.

## Known Issues

There are a few known issues right now. Batching doesn't really work because of some weird
issues that the library has been having as of late when running in node vs. the browser. There
are a few open questions around it, but it doesn't appear to be fixed as of yet.

Pulling too many blocks at once can yield an invalid RPC response from the node, and if it
doesn't throw an error, it's possible that it will actually return the incorrect values for
the blocks despite invididual blocks testing out correctly.
