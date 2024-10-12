<template>
    <div id="nav">
        <router-link to="/">Home</router-link>
        <router-link to="/import">Import</router-link>
    </div>
</template>

<style lang="css">
#nav .active-link {
    border-bottom: 2px solid;
}

/* Navigation */
#nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    margin-top: 0;
    padding: 30px;
    background: #2c3e50;
    color: white;
    display: flex;
    align-items: center;
    border-bottom: 5px solid #4e6c71;
    z-index: 2;
}

#nav a {
    display: inline-block;
    margin-right: 20px;
    color: white;
    opacity: 0.7;
    transition: 0.2 ease color;
}

#nav a.router-link-active,
#nav a:hover {
    opacity: 1;
}

#logo {
    font-weight: bold;
    font-size: 1.5rem;
    opacity: 1 !important;
}

a {
    text-decoration: none;
    font-weight: bold;
}
</style>