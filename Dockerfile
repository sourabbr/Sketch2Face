FROM taesungp/pytorch-cyclegan-and-pix2pix

RUN curl -sL https://deb.nodesource.com/setup_11.x | bash -
RUN apt-get install -y nodejs

RUN mkdir -p /workspace/input/valA /workspace/input/valB /workspace/output

WORKDIR /workspace/pytorch-CycleGAN-and-pix2pix
COPY checkpoints ./checkpoints

WORKDIR /workspace/app
COPY app .

RUN npm install
ENV PORT=8080
CMD npm start
EXPOSE 8080
# RUN npm install -g nodemon
# CMD nodemon -L
# CMD ["/bin/bash","-c","python test.py --phase val --dataroot /workspace/input --results_dir /workspace/output --name sketch2face_cyclegan --model cycle_gan  --direction AtoB --gpu_ids -1"]