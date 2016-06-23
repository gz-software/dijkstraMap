function path(prev, node, cost) {
    if (!(this instanceof path)) { return new path(prev, node, cost); }
    this.node = node;
    this.cost = cost;
    this.elements = function () {
        var a = prev ? prev.elements() : [];
        a.push(this.node);
        return a;
    }
    this.toString = function () {
        return (prev ? prev + '>' : "") + node + " (" + cost + ")";
    }
}
function insert_sorted(list, key, item) {
    for (var i = 0; i < list.length; ++i) {
        if (list[i][key] > item[key]) { list.splice(i, 0, item); return list; }
    }
    list.push(item);
    return list;
}
function findPath(from, to) {//输入起点---终点
    if (!(from instanceof node)) { from = node(from); } //起点  
    if (!(to instanceof node)) { to = node(to); } //终点
    var visited = {},
    stack = [path(null, from, 0)],
    cur;
    while (cur = stack.shift()) {
        console.log(cur.toString());
        if (cur.node === to) { return cur; }
        for (var i = 0; i < cur.node.links.length; ++i) {
            var link = cur.node.links[i],
        other = link.far(cur.node);
            if (visited[other]) { continue; }
            insert_sorted(stack, 'cost', path(cur, other, link.cost + cur.cost));
        }
        visited[cur.node] = true;
    }
}

function node(name) {//node方法 储存node[name]相关数据

    if (node.all[name]) {
        return node.all[name];
    }
    if (!(this instanceof node)) {
        return new node(name);
    }
    node.all[name] = this;
    this.name = name;
    this.links = [];
    this.toString = function () { return name; }

}
node.all = {};

//link方法,给2坐标,长度
function link(n1, n2, cost) {
    if (!(n1 instanceof node)) { //调用node方法
        n1 = node(n1);
    }
    if (!(n2 instanceof node)) {
        n2 = node(n2);
    }
    if (!(this instanceof link)) {
        return new link(n1, n2, cost);
    }
    for (var i = 0; i < n1.links.length; ++i) {
        var l = n1.links[i];
        if (l.n1 === n2 || l.n2 === n2) {
            l.cost = cost; return l;
        }
    }
    n1.links.push(this);
    n2.links.push(this);
    this.n1 = n1;
    this.n2 = n2;
    this.cost = cost;
    this.toString = function () { return n1 + ">" + n2 + " (" + cost + ")"; }
    this.far = function (near) { return (near == n2) ? n1 : n2; }
}