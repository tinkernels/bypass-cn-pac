# CN IP Whitelist PAC

Steps:

- Download http://ftp.apnic.net/apnic/stats/apnic/delegated-apnic-latest and place it as `data/delegated-apnic-lates.txt` 
- Run `python3 main.py -o whitelist.pac -p "SOCKS5 X.X.X.X:XXXX; SOCKS X.X.X.X:XXXX;"` to generate `whitelist.pac` file, remember to replace `SOCKS5 X.X.X.X:XXXX; SOCKS X.X.X.X:XXXX;` with your own proxy

P.S. All IPv6 addresses will return `DIRECT`
