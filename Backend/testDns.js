import dns from 'node:dns';

dns.setServers(['1.1.1.1']);

dns.resolveSrv(
  '_mongodb._tcp.cluster0.t8c1l1z.mongodb.net',
  (err, addresses) => {
    if (err) {
      console.error('DNS ERROR:', err);
    } else {
      console.log('DNS SUCCESS:');
      console.log(addresses);
    }
  }
);