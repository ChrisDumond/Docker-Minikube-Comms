## Install Minikube and Dependencies
Note: It's probably easiest to install choclolatey with admin priveleges then open admin powershell and install everything else with choco
https://chocolatey.org/install

#Install Minikube
Install minikube and the kubernetes CLI by running `choco install minikube kubernetes-cli`. 
https://kubernetes.io/docs/tasks/tools/install-minikube/

Minikube also requires an installed hypervisor to run on.
Docker for Windows automatically enables and runs on Hyper-V, which conflicted with VirtualBox when I tried to use it, so I just use Hyper-V. 

# (Windows 10 Pro or Enterprise) Enable Hyper-V if it isn't already enabled
You can enable Hyper-V using by using an administrative powershell and running 
`Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All`
https://docs.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v

Getting minikube to run with Hyper-V requires opening the Hyper-V manager (search for it in windows)
-> connect to local pc as server 
-> manage Virtual switches to add a virtual external network switch 
	(new switch -> external -> give it a name (tutorial I followed just called it "Primary Virtual Switch")
	https://medium.com/@JockDaRock/minikube-on-windows-10-with-hyper-v-6ef0f4dc158c

# Starting Minikube
To run minikube using Hyper-V as the driver, run
`minikube start --vm-driver hyperv --hyperv-virtual-switch "Primary Virtual Switch"`
you can also use other drivers listed here: https://kubernetes.io/docs/setup/minikube/#quickstart

Set docker environment to the one used by minikube (instead of the one that comes with docker for Windows, etc.) by running 
`minikube docker-env | Invoke-Expression`

this is so your "docker build" and "docker-compose" commands will build images inside minikube's docker registry.


## Build the Project

# Build the Images
Ensure your working directory is the root folder containing the docker-compose file; if it isn't, cd there.
Build the images inside minikube's docker daemon by running `docker-compose build` 

# Deploy the pods and services
The comms-client.yaml and comms-api.yaml files contain the configuration to start pods running containers for the client app and api app.
In practice, these would probably create *deployments* which allows automatic pod replication and load balancing rather than single pods, but these just create a single running pod for development and testing.

To deploy them, run `kubectl apply -f comms-client.yaml` and `kubectl apply -f comms-api.yaml`
You can also use "create" instead of "apply" here.
"apply" creates the pods and services if they don't exist, or updates them if they already exist and the yaml files have changed.
"create" will have the same effect if they don't exist, but will throw an error if they are running already.
The "-f" flag here is simply to specify the filename.

# Create the ingress controller to map paths to services
Pull the ingress controller maintained by nginx into your kubernetes environment by running
`kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/mandatory.yaml`
Then enable the ingress add-on inside minikube
`minikube addons enable ingress`
Configure the ingress server with the yaml file:
`kubectl apply -f comms-ingress.yaml`

run `kubectl get pods --all-namespaces`. If everything has gone correctly to this point, you should see the comms-api and comms-client in the default namespace, the ingress controller we just brought in, and several pods running in the kube-system namespace that were started by installing and starting minikube.

If you run `kubectl get services` you should also see the comms-api-service and comms-client-service running.

`kubectl get ingresses` should list the ingress controller alongside the IP to access it. 
This IP the minikube VM's IP. You can get that directly with `minikube ip`.

To run the app, use that IP in a web browser.

If communication is working correctly, you should see a "From Api: Hello World" on this screen (along with a couple things put onto the page by the angular CLI's starter template). You can also access the api by appending /api onto the path in the browser address bar.