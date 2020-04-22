#!/usr/bin/python
# -*- coding: utf-8 -*-
import os
import re
from argparse import ArgumentParser

private_networks = [
    ("127.0.0.0", 0xff),        # "127.0.0.0", "255.255.255.0"
    ("10.0.0.0", 0xffffff),     # "10.0.0.0", "255.0.0.0"
    ("172.16.0.0", 0xfffff),    # "172.16.0.0", "255.240.0.0"
    ("192.168.0.0", 0xffff),    # "192.168.0.0", "255.255.0.0"
]


def parse_args():
    parser = ArgumentParser()
    parser.add_argument('-i', '--input', dest='input', default=os.path.join('data', 'whitelist_template.pac'),
                        help='path to template pac')
    parser.add_argument('-o', '--output', dest='output', default='whitelist.pac',
                        help='path to output pac', metavar='PAC')
    parser.add_argument('-p', '--proxy', dest='proxy', default='"SOCKS5 127.0.0.1:1086; SOCKS 127.0.0.1:1086; DIRECT;"',
                        help='the proxy parameter in the pac file, for example,\
        "127.0.0.1:1080;"', metavar='SOCKS5')
    return parser.parse_args()


def read_file(filename):
    content = ''
    with open(filename, 'r') as f:
        content = f.read()
    return content


def writefile(input_file, proxy, output_file):
    pac_content = read_file(input_file)
    pac_content = pac_content.replace('__PROXY__', proxy)
    pac_content = pac_content.replace(
        '__CNIPv4Ranges__', generate_ipv4_ranges_for_pac())
    pac_content = pac_content.replace(
        '__PrivateNetworks__', generate_private_networks_for_pac())
    with open(output_file, 'w') as f:
        f.write(pac_content)


def cast_ip_2_int(ip: str):
    int_l = ip.split('.')
    ret = 0
    for i in range(4):
        ret = ret * 256 + int(int_l[i])
    return ret


def obtain_cn_ipv4_range(str_line: str):
    # apnic|CN|ipv4|1.1.12.0|1024|20110412|allocated
    regex = re.compile(
        r'apnic\|cn\|ipv4\|[0-9\.]+\|[0-9]+\|[0-9]+\|a.*', re.IGNORECASE)
    if regex.match(str_line):
        pieces = str_line.split('|')
        ip_range_head = pieces[3]
        ips_count = int(pieces[4])
        return ip_range_head, ips_count
    return None, None


def generate_ipv4_ranges_for_pac():
    cn_ipv4_ranges = dict()
    with open("data/delegated-apnic-latest.txt", "r") as f:
        for line in f:
            ip_range_head, ips_count = obtain_cn_ipv4_range(str(line))
            if not ip_range_head or not ips_count:
                continue
            ip_range_head_i = cast_ip_2_int(ip_range_head)
            ip_range_tail_i = ip_range_head_i + ips_count
            if ips_count > 0xffffff:
                print(f"WARN: will miss some IP - IP: {ip_range_head} COUNT: {ips_count}")
            first_8bit_of_ip_range_head_s = ip_range_head[:ip_range_head.index(
                '.')]
            range_array = [hex(ip_range_head_i & 0xffffff ), hex(ip_range_tail_i & 0xffffff)]
            if first_8bit_of_ip_range_head_s in cn_ipv4_ranges:
                range_array = cn_ipv4_ranges[first_8bit_of_ip_range_head_s] + range_array
            cn_ipv4_ranges[first_8bit_of_ip_range_head_s] = range_array
    json_content = '{'
    for k, v in cn_ipv4_ranges.items():
        json_content += f' "{k}": '
        json_content += f"[{','.join(v)}],\n"
    json_content = json_content[:-1]
    json_content += '}'
    return json_content


def generate_private_networks_for_pac():
    json_content = "{"
    for subnet,mask in private_networks:
        subnet_8bit_h = subnet[:subnet.index('.')]
        subnet_i = cast_ip_2_int(subnet)
        json_content += f' "{subnet_8bit_h}": '
        subnet_24bit_l = subnet_i & 0xFFFFFF
        json_content += f"[{hex(subnet_24bit_l)},{hex(subnet_24bit_l | mask)}],"
    json_content = json_content[:-1]
    json_content += '}'
    return json_content

def main():
    args = parse_args()
    writefile(args.input, '"' + args.proxy.strip('"') + '"', args.output)


if __name__ == '__main__':
    main()
