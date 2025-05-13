FROM ubuntu:22.04

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Set up locale
RUN apt-get update && apt-get install -y locales && \
    locale-gen en_US.UTF-8 && \
    update-locale LANG=en_US.UTF-8
ENV LANG=en_US.UTF-8
ENV LC_ALL=en_US.UTF-8

# Install essential tools
RUN apt-get update && apt-get install -y \
    curl \
    git \
    wget \
    gnupg \
    lsb-release \
    sudo \
    vim \
    build-essential \
    pkg-config \
    libssl-dev \
    libudev-dev \
    python3 \
    python3-pip \
    software-properties-common \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18.x
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && \
    apt-get update && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install Yarn
RUN npm install -g yarn

# Set up a non-root user with sudo access
ARG USERNAME=dev
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME && \
    useradd --uid $USER_UID --gid $USER_GID -m $USERNAME && \
    echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME && \
    chmod 0440 /etc/sudoers.d/$USERNAME

# Install Rust and Cargo using rustup
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Switch to non-root user for Rust/Cargo
USER $USERNAME
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
ENV PATH="/home/$USERNAME/.cargo/bin:${PATH}"

# Rust components
RUN rustup component add rustfmt && \
    rustup component add clippy && \
    rustup update

# Install Solana CLI tools
RUN sh -c "$(curl -sSfL https://release.solana.com/v1.17.7/install)" && \
    echo 'export PATH="/home/$USERNAME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc

ENV PATH="/home/$USERNAME/.local/share/solana/install/active_release/bin:${PATH}"

# Install Anchor CLI
RUN cargo install --git https://github.com/coral-xyz/anchor avm --locked && \
    avm install latest && \
    avm use latest

# Workspace directory
WORKDIR /workspace

# Create default Solana config for devnet
RUN mkdir -p /home/$USERNAME/.config/solana && \
    echo '[[ ! -f /home/$USERNAME/.config/solana/id.json ]] && solana-keygen new --no-passphrase -o /home/$USERNAME/.config/solana/id.json && solana config set --url https://api.devnet.solana.com' >> /home/$USERNAME/.bashrc

# Set ownership of everything to the new user
USER root
RUN chown -R $USERNAME:$USERNAME /home/$USERNAME

# Switch back to non-root user
USER $USERNAME

# Set the shell to bash
SHELL ["/bin/bash", "-c"] 