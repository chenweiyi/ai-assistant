# How to use Docker?

## Create Dockerfile

> The file name can also be named differently, such as `1.Dockerfile`. Use the `-f` parameter to specify the Dockerfile name when using `docker build`.

## Build Image

> `-t` represents the image name

```
# directly tag
docker build . -t ai-assistant:0.0.1

# Select the specified Dockerfile to build an image.
docker build . -f Dockerfile -t cwy829/ai-assistant:0.0.1
```

## Start Container

> `-d` represents starting the container in the background.
> `-p` represents specifying the port mapping, where the former is the host port and the latter is the container port.
> `-v` represents volume mapping. Since this project requires a configuration file, a configuration file needs to be created on the host to map to the container, otherwise, container startup cannot request normally.
> `--name` represents the name of the container instance to be started.
> `ai-assistant:0.6.0` is the image name.

```
docker run -d -p 3000:3000 -v ~/docker-data/.env:/ai-assistant/.env --name ai-assistant ai-assistant:0.0.1
```

## Publish Image

### Login

Firstly, visit [dockerhub](https://hub.docker.com/) and create an account.

After logging in, enter `docker login` in the local docker client or command line tool for client login. **This step requires a global proxy. Otherwise, login will fail.**

Next, label the username and version of the local image.

```
docker image tag [imageName] [username]/[repository]:[tag]

# Example
docker image tag ai-assistant:0.0.1 cwy829/ai-assistant:0.0.1
```

Finally, publish the `image` file.

```
docker image push [username]/[repository]:[tag]

# Example
docker image push cwy829/ai-assistant:0.0.1
```

Once published successfully, the published image can be seen on hub.docker.com.

## Reference document

- [Docker 入门教程-阮一峰](https://juejin.cn/post/6844903561432662023#heading-15)
- [掌握这 5 个技巧，让你的 Dockerfile 像个大师！](https://juejin.cn/post/7248145094600900669?share_token=a2f55354-38e1-4174-b2a0-4ac3c51e2b0c)
