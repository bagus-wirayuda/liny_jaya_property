<?php

namespace App\Models;

class Article extends WorkspaceModel
{
    protected $table = 'articles';

    protected $fillable = ['id', 'payload'];
}
