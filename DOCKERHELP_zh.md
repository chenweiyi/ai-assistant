# 如何使用 docker?

## 新建 Dockerfile 文件

> 也可以使用其他名字，比如 `1.Dockerfile`，需要在`docker build` 时增加 `-f` 参数指定 Dockerfile 文件名

## 构建 Image

> `-t` 表示镜像名

```
docker build -t ai-assistant:0.0.1 .
```

## 启动 Container

> `-d` 表示后台启动
> `-p` 表示指定端口映射，前面为宿主机端口，后者为 docker 容器内端口
> `-v` 表示卷积映射，因为本项目需要配置文件，所以需要在宿主机建一个配置文件来映射到容器内，不然容器启动无法正常请求。
> `--name` 表示启动容器实例的名称
> `ai-assistant:0.6.0` 最后面这个时镜像名称

```
docker run -d -p 3000:3000 -v ~/docker-data/.env:/ai-assistant/.env --name ai-assistant ai-assistant:0.0.1
```

## 发布 Image

### 登陆

首先访问 [dockerhub](https://hub.docker.com/) 创建一个账号。

登陆后，在本地 docker 客户端 或者 命令行工具里输入 `docker login` 进行客户端登陆。**这一步是需要全局代理的，不然登陆不上**

接着，为本地 image 标注用户名和版本

```
docker image tag [imageName] [username]/[repository]:[tag]

# 实例
docker image tag ai-assistant:0.0.1 cwy829/ai-assistant:0.0.1
```

最后，发布 `image` 文件

```
docker image push [username]/[repository]:[tag]

# 实例
docker image push cwy829/ai-assistant:0.0.1
```

发布成功后就可以在 hub.docker.com 上看到自己发布的镜像了。

## 参考文档

- [Docker 入门教程-阮一峰](https://juejin.cn/post/6844903561432662023#heading-15)
- [掌握这 5 个技巧，让你的 Dockerfile 像个大师！](https://juejin.cn/post/7248145094600900669?share_token=a2f55354-38e1-4174-b2a0-4ac3c51e2b0c)
