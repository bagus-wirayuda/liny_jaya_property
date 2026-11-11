<?php

namespace App\Models;

class Service extends WorkspaceModel
{
    protected $table = 'services';

    protected $fillable = ['id', 'payload'];
}
